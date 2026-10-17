package net.minecraft.world.level.chunk;

import com.google.common.base.Suppliers;
import com.mojang.datafixers.util.Pair;
import com.mojang.serialization.Codec;
import it.unimi.dsi.fastutil.ints.IntArraySet;
import it.unimi.dsi.fastutil.ints.IntSet;
import it.unimi.dsi.fastutil.longs.LongSet;
import it.unimi.dsi.fastutil.objects.Object2ObjectArrayMap;
import it.unimi.dsi.fastutil.objects.ObjectArraySet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Map.Entry;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import net.minecraft.CrashReport;
import net.minecraft.CrashReportCategory;
import net.minecraft.ReportedException;
import net.minecraft.SharedConstants;
import net.minecraft.Util;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.HolderSet;
import net.minecraft.core.Registry;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.SectionPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.protocol.game.DebugPackets;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.WorldGenRegion;
import net.minecraft.util.random.WeightedRandomList;
import net.minecraft.world.entity.MobCategory;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.LevelHeightAccessor;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.NoiseColumn;
import net.minecraft.world.level.StructureManager;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.BiomeGenerationSettings;
import net.minecraft.world.level.biome.BiomeManager;
import net.minecraft.world.level.biome.BiomeSource;
import net.minecraft.world.level.biome.FeatureSorter;
import net.minecraft.world.level.biome.MobSpawnSettings;
import net.minecraft.world.level.levelgen.GenerationStep;
import net.minecraft.world.level.levelgen.Heightmap;
import net.minecraft.world.level.levelgen.LegacyRandomSource;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.RandomSupport;
import net.minecraft.world.level.levelgen.WorldgenRandom;
import net.minecraft.world.level.levelgen.XoroshiroRandomSource;
import net.minecraft.world.level.levelgen.blending.Blender;
import net.minecraft.world.level.levelgen.placement.PlacedFeature;
import net.minecraft.world.level.levelgen.structure.BoundingBox;
import net.minecraft.world.level.levelgen.structure.Structure;
import net.minecraft.world.level.levelgen.structure.StructureCheckResult;
import net.minecraft.world.level.levelgen.structure.StructureSet;
import net.minecraft.world.level.levelgen.structure.StructureSpawnOverride;
import net.minecraft.world.level.levelgen.structure.StructureStart;
import net.minecraft.world.level.levelgen.structure.placement.ConcentricRingsStructurePlacement;
import net.minecraft.world.level.levelgen.structure.placement.RandomSpreadStructurePlacement;
import net.minecraft.world.level.levelgen.structure.placement.StructurePlacement;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplateManager;
import org.apache.commons.lang3.mutable.MutableBoolean;

public abstract class ChunkGenerator {
    public static final Codec<ChunkGenerator> CODEC = BuiltInRegistries.CHUNK_GENERATOR
        .byNameCodec()
        .dispatchStable(ChunkGenerator::codec, Function.identity());
    protected final BiomeSource biomeSource;
    private final Supplier<List<FeatureSorter.StepFeatureData>> featuresPerStep;
    private final Function<Holder<Biome>, BiomeGenerationSettings> generationSettingsGetter;

    public ChunkGenerator(BiomeSource param0) {
        this(param0, param0x -> param0x.value().getGenerationSettings());
    }

    public ChunkGenerator(BiomeSource param0, Function<Holder<Biome>, BiomeGenerationSettings> param1) {
        this.biomeSource = param0;
        this.generationSettingsGetter = param1;
        this.featuresPerStep = Suppliers.memoize(
            () -> FeatureSorter.buildFeaturesPerStep(List.copyOf(param0.possibleBiomes()), param1x -> param1.apply(param1x).features(), true)
        );
    }

    protected abstract Codec<? extends ChunkGenerator> codec();

    public ChunkGeneratorStructureState createState(HolderLookup<StructureSet> param0, RandomState param1, long param2) {
        return ChunkGeneratorStructureState.createForNormal(param1, param2, this.biomeSource, param0);
    }

    public Optional<ResourceKey<Codec<? extends ChunkGenerator>>> getTypeNameForDataFixer() {
        return BuiltInRegistries.CHUNK_GENERATOR.getResourceKey(this.codec());
    }

    public CompletableFuture<ChunkAccess> createBiomes(Executor param0, RandomState param1, Blender param2, StructureManager param3, ChunkAccess param4) {
        return CompletableFuture.supplyAsync(Util.wrapThreadWithTaskName("init_biomes", () -> {
            param4.fillBiomesFromNoise(this.biomeSource, param1.sampler());
            return param4;
        }), Util.backgroundExecutor());
    }

    public abstract void applyCarvers(
        WorldGenRegion var1, long var2, RandomState var4, BiomeManager var5, StructureManager var6, ChunkAccess var7, GenerationStep.Carving var8
    );

    @Nullable
    public Pair<BlockPos, Holder<Structure>> findNearestMapStructure(
        ServerLevel param0, HolderSet<Structure> param1, BlockPos param2, int param3, boolean param4
    ) {
        ChunkGeneratorStructureState var0 = param0.getChunkSource().getGeneratorState();
        Map<StructurePlacement, Set<Holder<Structure>>> var1 = new Object2ObjectArrayMap<>();

        for(Holder<Structure> var2 : param1) {
            for(StructurePlacement var3 : var0.getPlacementsForStructure(var2)) {
                var1.computeIfAbsent(var3, param0x -> new ObjectArraySet()).add(var2);
            }
        }

        if (var1.isEmpty()) {
            return null;
        } else {
            Pair<BlockPos, Holder<Structure>> var4 = null;
            double var5 = Double.MAX_VALUE;
            StructureManager var6 = param0.structureManager();
            List<Entry<StructurePlacement, Set<Holder<Structure>>>> var7 = new ArrayList<>(var1.size());

            for(Entry<StructurePlacement, Set<Holder<Structure>>> var8 : var1.entrySet()) {
                StructurePlacement var9 = var8.getKey();
                if (var9 instanceof ConcentricRingsStructurePlacement var10) {
                    Pair<BlockPos, Holder<Structure>> var11 = this.getNearestGeneratedStructure(var8.getValue(), param0, var6, param2, param4, var10);
                    if (var11 != null) {
                        BlockPos var12 = var11.getFirst();
                        double var13 = param2.distSqr(var12);
                        if (var13 < var5) {
                            var5 = var13;
                            var4 = var11;
                        }
                    }
                } else if (var9 instanceof RandomSpreadStructurePlacement) {
                    var7.add(var8);
                }
            }

            if (!var7.isEmpty()) {
                int var14 = SectionPos.blockToSectionCoord(param2.getX());
                int var15 = SectionPos.blockToSectionCoord(param2.getZ());

                for(int var16 = 0; var16 <= param3; ++var16) {
                    boolean var17 = false;

                    for(Entry<StructurePlacement, Set<Holder<Structure>>> var18 : var7) {
                        RandomSpreadStructurePlacement var19 = (RandomSpreadStructurePlacement)var18.getKey();
                        Pair<BlockPos, Holder<Structure>> var20 = getNearestGeneratedStructure(
                            var18.getValue(), param0, var6, var14, var15, var16, param4, var0.getLevelSeed(), var19
                        );
                        if (var20 != null) {
                            var17 = true;
                            double var21 = param2.distSqr(var20.getFirst());
                            if (var21 < var5) {
                                var5 = var21;
                                var4 = var20;
                            }
                        }
                    }

                    if (var17) {
                        return var4;
                    }
                }
            }

            return var4;
        }
    }

    @Nullable
    private Pair<BlockPos, Holder<Structure>> getNearestGeneratedStructure(
        Set<Holder<Structure>> param0, ServerLevel param1, StructureManager param2, BlockPos param3, boolean param4, ConcentricRingsStructurePlacement param5
    ) {
        List<ChunkPos> var0 = param1.getChunkSource().getGeneratorState().getRingPositionsFor(param5);
        if (var0 == null) {
            throw new IllegalStateException("Somehow tried to find structures for a placement that doesn't exist");
        } else {
            Pair<BlockPos, Holder<Structure>> var1 = null;
            double var2 = Double.MAX_VALUE;
            BlockPos.MutableBlockPos var3 = new BlockPos.MutableBlockPos();

            for(ChunkPos var4 : var0) {
                var3.set(SectionPos.sectionToBlockCoord(var4.x, 8), 32, SectionPos.sectionToBlockCoord(var4.z, 8));
                double var5 = var3.distSqr(param3);
                boolean var6 = var1 == null || var5 < var2;
                if (var6) {
                    Pair<BlockPos, Holder<Structure>> var7 = getStructureGeneratingAt(param0, param1, param2, param4, param5, var4);
                    if (var7 != null) {
                        var1 = var7;
                        var2 = var5;
                    }
                }
            }

            return var1;
        }
    }

    @Nullable
    private static Pair<BlockPos, Holder<Structure>> getNearestGeneratedStructure(
        Set<Holder<Structure>> param0,
        LevelReader param1,
        StructureManager param2,
        int param3,
        int param4,
        int param5,
        boolean param6,
        long param7,
        RandomSpreadStructurePlacement param8
    ) {
        int var0 = param8.spacing();

        for(int var1 = -param5; var1 <= param5; ++var1) {
            boolean var2 = var1 == -param5 || var1 == param5;

            for(int var3 = -param5; var3 <= param5; ++var3) {
                boolean var4 = var3 == -param5 || var3 == param5;
                if (var2 || var4) {
                    int var5 = param3 + var0 * var1;
                    int var6 = param4 + var0 * var3;
                    ChunkPos var7 = param8.getPotentialStructureChunk(param7, var5, var6);
                    Pair<BlockPos, Holder<Structure>> var8 = getStructureGeneratingAt(param0, param1, param2, param6, param8, var7);
                    if (var8 != null) {
                        return var8;
                    }
                }
            }
        }

        return null;
    }

    @Nullable
    private static Pair<BlockPos, Holder<Structure>> getStructureGeneratingAt(
        Set<Holder<Structure>> param0, LevelReader param1, StructureManager param2, boolean param3, StructurePlacement param4, ChunkPos param5
    ) {
        for(Holder<Structure> var0 : param0) {
            StructureCheckResult var1 = param2.checkStructurePresence(param5, var0.value(), param3);
            if (var1 != StructureCheckResult.START_NOT_PRESENT) {
                if (!param3 && var1 == StructureCheckResult.START_PRESENT) {
                    return Pair.of(param4.getLocatePos(param5), var0);
                }

                ChunkAccess var2 = param1.getChunk(param5.x, param5.z, ChunkStatus.STRUCTURE_STARTS);
                StructureStart var3 = param2.getStartForStructure(SectionPos.bottomOf(var2), var0.value(), var2);
                if (var3 != null && var3.isValid() && (!param3 || tryAddReference(param2, var3))) {
                    return Pair.of(param4.getLocatePos(var3.getChunkPos()), var0);
                }
            }
        }

        return null;
    }

    private static boolean tryAddReference(StructureManager param0, StructureStart param1) {
        if (param1.canBeReferenced()) {
            param0.addReference(param1);
            return true;
        } else {
            return false;
        }
    }

    public void applyBiomeDecoration(WorldGenLevel param0, ChunkAccess param1, StructureManager param2) {
        ChunkPos var0 = param1.getPos();
        if (!SharedConstants.debugVoidTerrain(var0)) {
            SectionPos var1 = SectionPos.of(var0, param0.getMinSection());
            BlockPos var2 = var1.origin();
            Registry<Structure> var3 = param0.registryAccess().registryOrThrow(Registries.STRUCTURE);
            Map<Integer, List<Structure>> var4 = var3.stream().collect(Collectors.groupingBy(param0x -> param0x.step().ordinal()));
            List<FeatureSorter.StepFeatureData> var5 = this.featuresPerStep.get();
            WorldgenRandom var6 = new WorldgenRandom(new XoroshiroRandomSource(RandomSupport.generateUniqueSeed()));
            long var7 = var6.setDecorationSeed(param0.getSeed(), var2.getX(), var2.getZ());
            Set<Holder<Biome>> var8 = new ObjectArraySet<>();
            ChunkPos.rangeClosed(var1.chunk(), 1).forEach(param2x -> {
                ChunkAccess var0x = param0.getChunk(param2x.x, param2x.z);

                for(LevelChunkSection var1x : var0x.getSections()) {
                    var1x.getBiomes().getAll(var8::add);
                }

            });
            var8.retainAll(this.biomeSource.possibleBiomes());
            int var9 = var5.size();

            try {
                Registry<PlacedFeature> var10 = param0.registryAccess().registryOrThrow(Registries.PLACED_FEATURE);
                int var11 = Math.max(GenerationStep.Decoration.values().length, var9);

                for(int var12 = 0; var12 < var11; ++var12) {
                    int var13 = 0;
                    if (param2.shouldGenerateStructures()) {
                        for(Structure var15 : var4.getOrDefault(var12, Collections.emptyList())) {
                            var6.setFeatureSeed(var7, var13, var12);
                            Supplier<String> var16 = () -> var3.getResourceKey(var15).map(Object::toString).orElseGet(var15::toString);

                            try {
                                param0.setCurrentlyGenerating(var16);
                                param2.startsForStructure(var1, var15)
                                    .forEach(param5 -> param5.placeInChunk(param0, param2, this, var6, getWritableArea(param1), var0));
                            } catch (Exception var291) {
                                CrashReport var18 = CrashReport.forThrowable(var291, "Feature placement");
                                var18.addCategory("Feature").setDetail("Description", var16::get);
                                throw new ReportedException(var18);
                            }

                            ++var13;
                        }
                    }

                    if (var12 < var9) {
                        IntSet var19 = new IntArraySet();

                        for(Holder<Biome> var20 : var8) {
                            List<HolderSet<PlacedFeature>> var21 = this.generationSettingsGetter.apply(var20).features();
                            if (var12 < var21.size()) {
                                HolderSet<PlacedFeature> var22 = var21.get(var12);
                                FeatureSorter.StepFeatureData var23 = var5.get(var12);
                                var22.stream().map(Holder::value).forEach(param2x -> var19.add(var23.indexMapping().applyAsInt(param2x)));
                            }
                        }

                        int var24 = var19.size();
                        int[] var25 = var19.toIntArray();
                        Arrays.sort(var25);
                        FeatureSorter.StepFeatureData var26 = var5.get(var12);

                        for(int var27 = 0; var27 < var24; ++var27) {
                            int var28 = var25[var27];
                            PlacedFeature var29 = var26.features().get(var28);
                            Supplier<String> var30 = () -> var10.getResourceKey(var29).map(Object::toString).orElseGet(var29::toString);
                            var6.setFeatureSeed(var7, var28, var12);

                            try {
                                param0.setCurrentlyGenerating(var30);
                                var29.placeWithBiomeCheck(param0, this, var6, var2);
                            } catch (Exception var301) {
                                CrashReport var32 = CrashReport.forThrowable(var301, "Feature placement");
                                var32.addCategory("Feature").setDetail("Description", var30::get);
                                throw new ReportedException(var32);
                            }
                        }
                    }
                }

                param0.setCurrentlyGenerating(null);
            } catch (Exception var31) {
                CrashReport var34 = CrashReport.forThrowable(var31, "Biome decoration");
                var34.addCategory("Generation").setDetail("CenterX", var0.x).setDetail("CenterZ", var0.z).setDetail("Seed", var7);
                throw new ReportedException(var34);
            }
        }
    }

    private static BoundingBox getWritableArea(ChunkAccess param0) {
        ChunkPos var0 = param0.getPos();
        int var1 = var0.getMinBlockX();
        int var2 = var0.getMinBlockZ();
        LevelHeightAccessor var3 = param0.getHeightAccessorForGeneration();
        int var4 = var3.getMinBuildHeight() + 1;
        int var5 = var3.getMaxBuildHeight() - 1;
        return new BoundingBox(var1, var4, var2, var1 + 15, var5, var2 + 15);
    }

    public abstract void buildSurface(WorldGenRegion var1, StructureManager var2, RandomState var3, ChunkAccess var4);

    public abstract void spawnOriginalMobs(WorldGenRegion var1);

    public int getSpawnHeight(LevelHeightAccessor param0) {
        return 64;
    }

    public BiomeSource getBiomeSource() {
        return this.biomeSource;
    }

    public abstract int getGenDepth();

    public WeightedRandomList<MobSpawnSettings.SpawnerData> getMobsAt(Holder<Biome> param0, StructureManager param1, MobCategory param2, BlockPos param3) {
        Map<Structure, LongSet> var0 = param1.getAllStructuresAt(param3);

        for(Entry<Structure, LongSet> var1 : var0.entrySet()) {
            Structure var2 = var1.getKey();
            StructureSpawnOverride var3 = var2.spawnOverrides().get(param2);
            if (var3 != null) {
                MutableBoolean var4 = new MutableBoolean(false);
                Predicate<StructureStart> var5 = var3.boundingBox() == StructureSpawnOverride.BoundingBoxType.PIECE
                    ? param2x -> param1.structureHasPieceAt(param3, param2x)
                    : param1x -> param1x.getBoundingBox().isInside(param3);
                param1.fillStartsForStructure(var2, var1.getValue(), param2x -> {
                    if (var4.isFalse() && var5.test(param2x)) {
                        var4.setTrue();
                    }

                });
                if (var4.isTrue()) {
                    return var3.spawns();
                }
            }
        }

        return param0.value().getMobSettings().getMobs(param2);
    }

    public void createStructures(
        RegistryAccess param0, ChunkGeneratorStructureState param1, StructureManager param2, ChunkAccess param3, StructureTemplateManager param4
    ) {
        ChunkPos var0 = param3.getPos();
        SectionPos var1 = SectionPos.bottomOf(param3);
        RandomState var2 = param1.randomState();
        param1.possibleStructureSets().forEach(param8 -> {
            StructurePlacement var0x = param8.value().placement();
            List<StructureSet.StructureSelectionEntry> var1x = param8.value().structures();

            for(StructureSet.StructureSelectionEntry var5x : var1x) {
                StructureStart var6x = param2.getStartForStructure(var1, var5x.structure().value(), param3);
                if (var6x != null && var6x.isValid()) {
                    return;
                }
            }

            if (var0x.isStructureChunk(param1, var0.x, var0.z)) {
                if (var1x.size() == 1) {
                    this.tryGenerateStructure(var1x.get(0), param2, param0, var2, param4, param1.getLevelSeed(), param3, var0, var1);
                } else {
                    ArrayList<StructureSet.StructureSelectionEntry> var4 = new ArrayList<>(var1x.size());
                    var4.addAll(var1x);
                    WorldgenRandom var5 = new WorldgenRandom(new LegacyRandomSource(0L));
                    var5.setLargeFeatureSeed(param1.getLevelSeed(), var0.x, var0.z);
                    int var6 = 0;

                    for(StructureSet.StructureSelectionEntry var7 : var4) {
                        var6 += var7.weight();
                    }

                    while(!var4.isEmpty()) {
                        int var8 = var5.nextInt(var6);
                        int var9 = 0;

                        for(StructureSet.StructureSelectionEntry var10 : var4) {
                            var8 -= var10.weight();
                            if (var8 < 0) {
                                break;
                            }

                            ++var9;
                        }

                        StructureSet.StructureSelectionEntry var11 = var4.get(var9);
                        if (this.tryGenerateStructure(var11, param2, param0, var2, param4, param1.getLevelSeed(), param3, var0, var1)) {
                            return;
                        }

                        var4.remove(var9);
                        var6 -= var11.weight();
                    }

                }
            }
        });
    }

    private boolean tryGenerateStructure(
        StructureSet.StructureSelectionEntry param0,
        StructureManager param1,
        RegistryAccess param2,
        RandomState param3,
        StructureTemplateManager param4,
        long param5,
        ChunkAccess param6,
        ChunkPos param7,
        SectionPos param8
    ) {
        Structure var0 = param0.structure().value();
        int var1 = fetchReferences(param1, param6, param8, var0);
        HolderSet<Biome> var2 = var0.biomes();
        Predicate<Holder<Biome>> var3 = var2::contains;
        StructureStart var4 = var0.generate(param2, this, this.biomeSource, param3, param4, param5, param7, var1, param6, var3);
        if (var4.isValid()) {
            param1.setStartForStructure(param8, var0, var4, param6);
            return true;
        } else {
            return false;
        }
    }

    private static int fetchReferences(StructureManager param0, ChunkAccess param1, SectionPos param2, Structure param3) {
        StructureStart var0 = param0.getStartForStructure(param2, param3, param1);
        return var0 != null ? var0.getReferences() : 0;
    }

    public void createReferences(WorldGenLevel param0, StructureManager param1, ChunkAccess param2) {
        int var0 = 8;
        ChunkPos var1 = param2.getPos();
        int var2 = var1.x;
        int var3 = var1.z;
        int var4 = var1.getMinBlockX();
        int var5 = var1.getMinBlockZ();
        SectionPos var6 = SectionPos.bottomOf(param2);

        for(int var7 = var2 - 8; var7 <= var2 + 8; ++var7) {
            for(int var8 = var3 - 8; var8 <= var3 + 8; ++var8) {
                long var9 = ChunkPos.asLong(var7, var8);

                for(StructureStart var10 : param0.getChunk(var7, var8).getAllStarts().values()) {
                    try {
                        if (var10.isValid() && var10.getBoundingBox().intersects(var4, var5, var4 + 15, var5 + 15)) {
                            param1.addReferenceForStructure(var6, var10.getStructure(), var9, param2);
                            DebugPackets.sendStructurePacket(param0, var10);
                        }
                    } catch (Exception var21) {
                        CrashReport var12 = CrashReport.forThrowable(var21, "Generating structure reference");
                        CrashReportCategory var13 = var12.addCategory("Structure");
                        Optional<? extends Registry<Structure>> var14 = param0.registryAccess().registry(Registries.STRUCTURE);
                        var13.setDetail("Id", () -> var14.<String>map(param1x -> param1x.getKey(var10.getStructure()).toString()).orElse("UNKNOWN"));
                        var13.setDetail("Name", () -> BuiltInRegistries.STRUCTURE_TYPE.getKey(var10.getStructure().type()).toString());
                        var13.setDetail("Class", () -> var10.getStructure().getClass().getCanonicalName());
                        throw new ReportedException(var12);
                    }
                }
            }
        }

    }

    public abstract CompletableFuture<ChunkAccess> fillFromNoise(Executor var1, Blender var2, RandomState var3, StructureManager var4, ChunkAccess var5);

    public abstract int getSeaLevel();

    public abstract int getMinY();

    public abstract int getBaseHeight(int var1, int var2, Heightmap.Types var3, LevelHeightAccessor var4, RandomState var5);

    public abstract NoiseColumn getBaseColumn(int var1, int var2, LevelHeightAccessor var3, RandomState var4);

    public int getFirstFreeHeight(int param0, int param1, Heightmap.Types param2, LevelHeightAccessor param3, RandomState param4) {
        return this.getBaseHeight(param0, param1, param2, param3, param4);
    }

    public int getFirstOccupiedHeight(int param0, int param1, Heightmap.Types param2, LevelHeightAccessor param3, RandomState param4) {
        return this.getBaseHeight(param0, param1, param2, param3, param4) - 1;
    }

    public abstract void addDebugScreenInfo(List<String> var1, RandomState var2, BlockPos var3);

    @Deprecated
    public BiomeGenerationSettings getBiomeGenerationSettings(Holder<Biome> param0) {
        return this.generationSettingsGetter.apply(param0);
    }
}
