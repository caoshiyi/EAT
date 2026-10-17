package net.minecraft.world.level.chunk;

import com.google.common.base.Stopwatch;
import com.mojang.datafixers.util.Pair;
import com.mojang.logging.LogUtils;
import it.unimi.dsi.fastutil.objects.Object2ObjectArrayMap;
import it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import net.minecraft.Util;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderLookup;
import net.minecraft.core.HolderSet;
import net.minecraft.core.SectionPos;
import net.minecraft.util.RandomSource;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.BiomeSource;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.structure.Structure;
import net.minecraft.world.level.levelgen.structure.StructureSet;
import net.minecraft.world.level.levelgen.structure.placement.ConcentricRingsStructurePlacement;
import net.minecraft.world.level.levelgen.structure.placement.StructurePlacement;
import org.slf4j.Logger;

public class ChunkGeneratorStructureState {
    private static final Logger LOGGER = LogUtils.getLogger();
    private final RandomState randomState;
    private final BiomeSource biomeSource;
    private final long levelSeed;
    private final long concentricRingsSeed;
    private final Map<Structure, List<StructurePlacement>> placementsForStructure = new Object2ObjectOpenHashMap<>();
    private final Map<ConcentricRingsStructurePlacement, CompletableFuture<List<ChunkPos>>> ringPositions = new Object2ObjectArrayMap<>();
    private boolean hasGeneratedPositions;
    private final List<Holder<StructureSet>> possibleStructureSets;

    public static ChunkGeneratorStructureState createForFlat(RandomState param0, long param1, BiomeSource param2, Stream<Holder<StructureSet>> param3) {
        List<Holder<StructureSet>> var0 = param3.filter(param1x -> hasBiomesForStructureSet(param1x.value(), param2)).toList();
        return new ChunkGeneratorStructureState(param0, param2, param1, 0L, var0);
    }

    public static ChunkGeneratorStructureState createForNormal(RandomState param0, long param1, BiomeSource param2, HolderLookup<StructureSet> param3) {
        List<Holder<StructureSet>> var0 = param3.listElements()
            .filter(param1x -> hasBiomesForStructureSet(param1x.value(), param2))
            .collect(Collectors.toUnmodifiableList());
        return new ChunkGeneratorStructureState(param0, param2, param1, param1, var0);
    }

    private static boolean hasBiomesForStructureSet(StructureSet param0, BiomeSource param1) {
        Stream<Holder<Biome>> var0 = param0.structures().stream().flatMap(param0x -> {
            Structure var0x = param0x.structure().value();
            return var0x.biomes().stream();
        });
        return var0.anyMatch(param1.possibleBiomes()::contains);
    }

    private ChunkGeneratorStructureState(RandomState param0, BiomeSource param1, long param2, long param3, List<Holder<StructureSet>> param4) {
        this.randomState = param0;
        this.levelSeed = param2;
        this.biomeSource = param1;
        this.concentricRingsSeed = param3;
        this.possibleStructureSets = param4;
    }

    public List<Holder<StructureSet>> possibleStructureSets() {
        return this.possibleStructureSets;
    }

    private void generatePositions() {
        Set<Holder<Biome>> var0 = this.biomeSource.possibleBiomes();
        this.possibleStructureSets().forEach(param1 -> {
            StructureSet var0x = param1.value();
            boolean var1x = false;

            for(StructureSet.StructureSelectionEntry var2 : var0x.structures()) {
                Structure var3 = var2.structure().value();
                if (var3.biomes().stream().anyMatch(var0::contains)) {
                    this.placementsForStructure.computeIfAbsent(var3, param0x -> new ArrayList()).add(var0x.placement());
                    var1x = true;
                }
            }

            if (var1x) {
                StructurePlacement var4 = var0x.placement();
                if (var4 instanceof ConcentricRingsStructurePlacement var5) {
                    this.ringPositions.put(var5, this.generateRingPositions(param1, var5));
                }
            }

        });
    }

    private CompletableFuture<List<ChunkPos>> generateRingPositions(Holder<StructureSet> param0, ConcentricRingsStructurePlacement param1) {
        if (param1.count() == 0) {
            return CompletableFuture.completedFuture(List.of());
        } else {
            Stopwatch var0 = Stopwatch.createStarted(Util.TICKER);
            int var1 = param1.distance();
            int var2 = param1.count();
            List<CompletableFuture<ChunkPos>> var3 = new ArrayList<>(var2);
            int var4 = param1.spread();
            HolderSet<Biome> var5 = param1.preferredBiomes();
            RandomSource var6 = RandomSource.create();
            var6.setSeed(this.concentricRingsSeed);
            double var7 = var6.nextDouble() * Math.PI * 2.0;
            int var8 = 0;
            int var9 = 0;

            for(int var10 = 0; var10 < var2; ++var10) {
                double var11 = (double)(4 * var1 + var1 * var9 * 6) + (var6.nextDouble() - 0.5) * (double)var1 * 2.5;
                int var12 = (int)Math.round(Math.cos(var7) * var11);
                int var13 = (int)Math.round(Math.sin(var7) * var11);
                RandomSource var14 = var6.fork();
                var3.add(
                    CompletableFuture.supplyAsync(
                        () -> {
                            Pair<BlockPos, Holder<Biome>> var0x = this.biomeSource
                                .findBiomeHorizontal(
                                    SectionPos.sectionToBlockCoord(var12, 8),
                                    0,
                                    SectionPos.sectionToBlockCoord(var13, 8),
                                    112,
                                    var5::contains,
                                    var14,
                                    this.randomState.sampler()
                                );
                            if (var0x != null) {
                                BlockPos var1x = var0x.getFirst();
                                return new ChunkPos(SectionPos.blockToSectionCoord(var1x.getX()), SectionPos.blockToSectionCoord(var1x.getZ()));
                            } else {
                                return new ChunkPos(var12, var13);
                            }
                        },
                        Util.backgroundExecutor()
                    )
                );
                var7 += (Math.PI * 2) / (double)var4;
                if (++var8 == var4) {
                    ++var9;
                    var8 = 0;
                    var4 += 2 * var4 / (var9 + 1);
                    var4 = Math.min(var4, var2 - var10);
                    var7 += var6.nextDouble() * Math.PI * 2.0;
                }
            }

            return Util.sequence(var3).thenApply((Function<? super List<ChunkPos>, ? extends List<ChunkPos>>)(param2 -> {
                double var0x = (double)var0.stop().elapsed(TimeUnit.MILLISECONDS) / 1000.0;
                LOGGER.debug("Calculation for {} took {}s", param0, var0x);
                return param2;
            }));
        }
    }

    public void ensureStructuresGenerated() {
        if (!this.hasGeneratedPositions) {
            this.generatePositions();
            this.hasGeneratedPositions = true;
        }

    }

    @Nullable
    public List<ChunkPos> getRingPositionsFor(ConcentricRingsStructurePlacement param0) {
        this.ensureStructuresGenerated();
        CompletableFuture<List<ChunkPos>> var0 = this.ringPositions.get(param0);
        return var0 != null ? var0.join() : null;
    }

    public List<StructurePlacement> getPlacementsForStructure(Holder<Structure> param0) {
        this.ensureStructuresGenerated();
        return this.placementsForStructure.getOrDefault(param0.value(), List.of());
    }

    public RandomState randomState() {
        return this.randomState;
    }

    public boolean hasStructureChunkInRange(Holder<StructureSet> param0, int param1, int param2, int param3) {
        StructurePlacement var0 = param0.value().placement();

        for(int var1 = param1 - param3; var1 <= param1 + param3; ++var1) {
            for(int var2 = param2 - param3; var2 <= param2 + param3; ++var2) {
                if (var0.isStructureChunk(this, var1, var2)) {
                    return true;
                }
            }
        }

        return false;
    }

    public long getLevelSeed() {
        return this.levelSeed;
    }
}
