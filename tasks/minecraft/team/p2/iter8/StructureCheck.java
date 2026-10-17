package net.minecraft.world.level.levelgen.structure;

import com.mojang.datafixers.DataFixer;
import com.mojang.logging.LogUtils;
import it.unimi.dsi.fastutil.longs.Long2BooleanMap;
import it.unimi.dsi.fastutil.longs.Long2BooleanOpenHashMap;
import it.unimi.dsi.fastutil.longs.Long2ObjectMap;
import it.unimi.dsi.fastutil.longs.Long2ObjectOpenHashMap;
import it.unimi.dsi.fastutil.objects.Object2IntMap;
import it.unimi.dsi.fastutil.objects.Object2IntMaps;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiFunction;
import javax.annotation.Nullable;
import net.minecraft.core.Registry;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.registries.Registries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.IntTag;
import net.minecraft.nbt.Tag;
import net.minecraft.nbt.visitors.CollectFields;
import net.minecraft.nbt.visitors.FieldSelector;
import net.minecraft.resources.ResourceKey;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.util.datafix.DataFixTypes;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelHeightAccessor;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.BiomeSource;
import net.minecraft.world.level.chunk.ChunkGenerator;
import net.minecraft.world.level.chunk.storage.ChunkScanAccess;
import net.minecraft.world.level.chunk.storage.ChunkStorage;
import net.minecraft.world.level.levelgen.RandomState;
import net.minecraft.world.level.levelgen.structure.templatesystem.StructureTemplateManager;
import org.slf4j.Logger;

public class StructureCheck {
    private static final Logger LOGGER = LogUtils.getLogger();
    private static final int NO_STRUCTURE = -1;
    private final ChunkScanAccess storageAccess;
    private final RegistryAccess registryAccess;
    private final Registry<Biome> biomes;
    private final Registry<Structure> structureConfigs;
    private final StructureTemplateManager structureTemplateManager;
    private final ResourceKey<Level> dimension;
    private final ChunkGenerator chunkGenerator;
    private final RandomState randomState;
    private final LevelHeightAccessor heightAccessor;
    private final BiomeSource biomeSource;
    private final long seed;
    private final DataFixer fixerUpper;
    private final Long2ObjectMap<Object2IntMap<Structure>> loadedChunks = new Long2ObjectOpenHashMap<>();
    private final Map<Structure, Long2BooleanMap> featureChecks = new HashMap<>();

    public StructureCheck(
        ChunkScanAccess param0,
        RegistryAccess param1,
        StructureTemplateManager param2,
        ResourceKey<Level> param3,
        ChunkGenerator param4,
        RandomState param5,
        LevelHeightAccessor param6,
        BiomeSource param7,
        long param8,
        DataFixer param9
    ) {
        this.storageAccess = param0;
        this.registryAccess = param1;
        this.structureTemplateManager = param2;
        this.dimension = param3;
        this.chunkGenerator = param4;
        this.randomState = param5;
        this.heightAccessor = param6;
        this.biomeSource = param7;
        this.seed = param8;
        this.fixerUpper = param9;
        this.biomes = param1.registryOrThrow(Registries.BIOME);
        this.structureConfigs = param1.registryOrThrow(Registries.STRUCTURE);
    }

    public StructureCheckResult checkStart(ChunkPos param0, Structure param1, boolean param2) {
        long var0 = param0.toLong();
        Object2IntMap<Structure> var1 = this.loadedChunks.get(var0);
        if (var1 != null) {
            return this.checkStructureInfo(var1, param1, param2);
        } else {
            StructureCheckResult var2 = this.tryLoadFromStorage(param0, param1, param2, var0);
            if (var2 != null) {
                return var2;
            } else {
                boolean var3 = this.featureChecks
                    .computeIfAbsent(param1, param0x -> new Long2BooleanOpenHashMap())
                    .computeIfAbsent(var0, param2x -> this.canCreateStructure(param0, param1));
                return !var3 ? StructureCheckResult.START_NOT_PRESENT : StructureCheckResult.CHUNK_LOAD_NEEDED;
            }
        }
    }

    private boolean canCreateStructure(ChunkPos param0, Structure param1) {
        return param1.findValidGenerationPoint(
                new Structure.GenerationContext(
                    this.registryAccess,
                    this.chunkGenerator,
                    this.biomeSource,
                    this.randomState,
                    this.structureTemplateManager,
                    this.seed,
                    param0,
                    this.heightAccessor,
                    param1.biomes()::contains
                )
            )
            .isPresent();
    }

    @Nullable
    private StructureCheckResult tryLoadFromStorage(ChunkPos param0, Structure param1, boolean param2, long param3) {
        CollectFields var0 = new CollectFields(
            new FieldSelector(IntTag.TYPE, "DataVersion"),
            new FieldSelector("Level", "Structures", CompoundTag.TYPE, "Starts"),
            new FieldSelector("structures", CompoundTag.TYPE, "starts")
        );

        try {
            this.storageAccess.scanChunk(param0, var0).join();
        } catch (Exception var13) {
            LOGGER.warn("Failed to read chunk {}", param0, var13);
            return StructureCheckResult.CHUNK_LOAD_NEEDED;
        }

        Tag var2 = var0.getResult();
        if (!(var2 instanceof CompoundTag)) {
            return null;
        } else {
            CompoundTag var3 = (CompoundTag)var2;
            int var4 = ChunkStorage.getVersion(var3);
            if (var4 <= 1493) {
                return StructureCheckResult.CHUNK_LOAD_NEEDED;
            } else {
                ChunkStorage.injectDatafixingContext(var3, this.dimension, this.chunkGenerator.getTypeNameForDataFixer());

                CompoundTag var5;
                try {
                    var5 = DataFixTypes.CHUNK.updateToCurrentVersion(this.fixerUpper, var3, var4);
                } catch (Exception var12) {
                    LOGGER.warn("Failed to partially datafix chunk {}", param0, var12);
                    return StructureCheckResult.CHUNK_LOAD_NEEDED;
                }

                Object2IntMap<Structure> var8 = this.loadStructures(var5);
                if (var8 == null) {
                    return null;
                } else {
                    this.storeFullResults(param3, var8);
                    return this.checkStructureInfo(var8, param1, param2);
                }
            }
        }
    }

    @Nullable
    private Object2IntMap<Structure> loadStructures(CompoundTag param0) {
        if (!param0.contains("structures", 10)) {
            return null;
        } else {
            CompoundTag var0 = param0.getCompound("structures");
            if (!var0.contains("starts", 10)) {
                return null;
            } else {
                CompoundTag var1 = var0.getCompound("starts");
                if (var1.isEmpty()) {
                    return Object2IntMaps.emptyMap();
                } else {
                    Object2IntMap<Structure> var2 = new Object2IntOpenHashMap<>();
                    Registry<Structure> var3 = this.registryAccess.registryOrThrow(Registries.STRUCTURE);

                    for(String var4 : var1.getAllKeys()) {
                        ResourceLocation var5 = ResourceLocation.tryParse(var4);
                        if (var5 != null) {
                            Structure var6 = var3.get(var5);
                            if (var6 != null) {
                                CompoundTag var7 = var1.getCompound(var4);
                                if (!var7.isEmpty()) {
                                    String var8 = var7.getString("id");
                                    if (!"INVALID".equals(var8)) {
                                        int var9 = var7.getInt("references");
                                        var2.put(var6, var9);
                                    }
                                }
                            }
                        }
                    }

                    return var2;
                }
            }
        }
    }

    private static Object2IntMap<Structure> deduplicateEmptyMap(Object2IntMap<Structure> param0) {
        return param0.isEmpty() ? Object2IntMaps.emptyMap() : param0;
    }

    private StructureCheckResult checkStructureInfo(Object2IntMap<Structure> param0, Structure param1, boolean param2) {
        int var0 = param0.getOrDefault(param1, -1);
        return var0 == -1 || param2 && var0 != 0 ? StructureCheckResult.START_NOT_PRESENT : StructureCheckResult.START_PRESENT;
    }

    public void onStructureLoad(ChunkPos param0, Map<Structure, StructureStart> param1) {
        long var0 = param0.toLong();
        Object2IntMap<Structure> var1 = new Object2IntOpenHashMap<>();
        param1.forEach((param1x, param2) -> {
            if (param2.isValid()) {
                var1.put(param1x, param2.getReferences());
            }

        });
        this.storeFullResults(var0, var1);
    }

    private void storeFullResults(long param0, Object2IntMap<Structure> param1) {
        this.loadedChunks.put(param0, deduplicateEmptyMap(param1));
        this.featureChecks.values().forEach(param1x -> param1x.remove(param0));
    }

    public void incrementReference(ChunkPos param0, Structure param1) {
        this.loadedChunks
            .compute(param0.toLong(), (BiFunction<? super Long, ? super Object2IntMap<Structure>, ? extends Object2IntMap<Structure>>)((param1x, param2) -> {
                if (param2 == null || param2.isEmpty()) {
                    param2 = new Object2IntOpenHashMap<>();
                }
    
                param2.computeInt(param1, (param0x, param1xx) -> param1xx == null ? 1 : param1xx + 1);
                return param2;
            }));
    }
}
