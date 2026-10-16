package net.minecraft.world.level.levelgen.structure.placement;

import com.mojang.datafixers.Products.P5;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import com.mojang.serialization.codecs.RecordCodecBuilder.Instance;
import com.mojang.serialization.codecs.RecordCodecBuilder.Mu;
import java.util.Optional;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Holder;
import net.minecraft.core.Vec3i;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.RegistryFileCodec;
import net.minecraft.util.ExtraCodecs;
import net.minecraft.util.StringRepresentable;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.chunk.ChunkGeneratorStructureState;
import net.minecraft.world.level.levelgen.LegacyRandomSource;
import net.minecraft.world.level.levelgen.WorldgenRandom;
import net.minecraft.world.level.levelgen.structure.StructureSet;

public abstract class StructurePlacement {
    public static final Codec<StructurePlacement> CODEC = BuiltInRegistries.STRUCTURE_PLACEMENT
        .byNameCodec()
        .dispatch(StructurePlacement::type, StructurePlacementType::codec);
    private static final int HIGHLY_ARBITRARY_RANDOM_SALT = 10387320;
    private final Vec3i locateOffset;
    private final StructurePlacement.FrequencyReductionMethod frequencyReductionMethod;
    private final float frequency;
    private final int salt;
    private final Optional<StructurePlacement.ExclusionZone> exclusionZone;

    protected static <S extends StructurePlacement> P5<Mu<S>, Vec3i, StructurePlacement.FrequencyReductionMethod, Float, Integer, Optional<StructurePlacement.ExclusionZone>> placementCodec(
        Instance<S> param0
    ) {
        return param0.group(
            Vec3i.offsetCodec(16).optionalFieldOf("locate_offset", Vec3i.ZERO).forGetter(StructurePlacement::locateOffset),
            StructurePlacement.FrequencyReductionMethod.CODEC
                .optionalFieldOf("frequency_reduction_method", StructurePlacement.FrequencyReductionMethod.DEFAULT)
                .forGetter(StructurePlacement::frequencyReductionMethod),
            Codec.floatRange(0.0F, 1.0F).optionalFieldOf("frequency", 1.0F).forGetter(StructurePlacement::frequency),
            ExtraCodecs.NON_NEGATIVE_INT.fieldOf("salt").forGetter(StructurePlacement::salt),
            StructurePlacement.ExclusionZone.CODEC.optionalFieldOf("exclusion_zone").forGetter(StructurePlacement::exclusionZone)
        );
    }

    protected StructurePlacement(
        Vec3i param0, StructurePlacement.FrequencyReductionMethod param1, float param2, int param3, Optional<StructurePlacement.ExclusionZone> param4
    ) {
        this.locateOffset = param0;
        this.frequencyReductionMethod = param1;
        this.frequency = param2;
        this.salt = param3;
        this.exclusionZone = param4;
    }

    protected Vec3i locateOffset() {
        return this.locateOffset;
    }

    protected StructurePlacement.FrequencyReductionMethod frequencyReductionMethod() {
        return this.frequencyReductionMethod;
    }

    protected float frequency() {
        return this.frequency;
    }

    protected int salt() {
        return this.salt;
    }

    protected Optional<StructurePlacement.ExclusionZone> exclusionZone() {
        return this.exclusionZone;
    }

    public boolean isStructureChunk(ChunkGeneratorStructureState param0, int param1, int param2) {
        if (!this.isPlacementChunk(param0, param1, param2)) {
            return false;
        } else if (this.frequency < 1.0F && !this.frequencyReductionMethod.shouldGenerate(param0.getLevelSeed(), this.salt, param1, param2, this.frequency)) {
            return false;
        } else {
            return !this.exclusionZone.isPresent() || !this.exclusionZone.get().isPlacementForbidden(param0, param1, param2);
        }
    }

    protected abstract boolean isPlacementChunk(ChunkGeneratorStructureState var1, int var2, int var3);

    public BlockPos getLocatePos(ChunkPos param0) {
        return new BlockPos(param0.getMinBlockX(), 0, param0.getMinBlockZ()).offset(this.locateOffset());
    }

    public abstract StructurePlacementType<?> type();

    private static boolean probabilityReducer(long param0, int param1, int param2, int param3, float param4) {
        WorldgenRandom var0 = new WorldgenRandom(new LegacyRandomSource(0L));
        var0.setLargeFeatureWithSalt(param0, param1, param2, param3);
        return var0.nextFloat() < param4;
    }

    private static boolean legacyProbabilityReducerWithDouble(long param0, int param1, int param2, int param3, float param4) {
        WorldgenRandom var0 = new WorldgenRandom(new LegacyRandomSource(0L));
        var0.setLargeFeatureSeed(param0, param2, param3);
        return var0.nextDouble() < (double)param4;
    }

    private static boolean legacyArbitrarySaltProbabilityReducer(long param0, int param1, int param2, int param3, float param4) {
        WorldgenRandom var0 = new WorldgenRandom(new LegacyRandomSource(0L));
        var0.setLargeFeatureWithSalt(param0, param2, param3, 10387320);
        return var0.nextFloat() < param4;
    }

    private static boolean legacyPillagerOutpostReducer(long param0, int param1, int param2, int param3, float param4) {
        int var0 = param2 >> 4;
        int var1 = param3 >> 4;
        WorldgenRandom var2 = new WorldgenRandom(new LegacyRandomSource(0L));
        var2.setSeed((long)(var0 ^ var1 << 4) ^ param0);
        var2.nextInt();
        return var2.nextInt((int)(1.0F / param4)) == 0;
    }

    @Deprecated
    public static record ExclusionZone(Holder<StructureSet> otherSet, int chunkCount) {
        public static final Codec<StructurePlacement.ExclusionZone> CODEC = RecordCodecBuilder.create(
            param0 -> param0.group(
                        RegistryFileCodec.create(Registries.STRUCTURE_SET, StructureSet.DIRECT_CODEC, false)
                            .fieldOf("other_set")
                            .forGetter(StructurePlacement.ExclusionZone::otherSet),
                        Codec.intRange(1, 16).fieldOf("chunk_count").forGetter(StructurePlacement.ExclusionZone::chunkCount)
                    )
                    .apply(param0, StructurePlacement.ExclusionZone::new)
        );

        boolean isPlacementForbidden(ChunkGeneratorStructureState param0, int param1, int param2) {
            return param0.hasStructureChunkInRange(this.otherSet, param1, param2, this.chunkCount);
        }
    }

    @FunctionalInterface
    public interface FrequencyReducer {
        boolean shouldGenerate(long var1, int var3, int var4, int var5, float var6);
    }

    public static enum FrequencyReductionMethod implements StringRepresentable {
        DEFAULT("default", StructurePlacement::probabilityReducer),
        LEGACY_TYPE_1("legacy_type_1", StructurePlacement::legacyPillagerOutpostReducer),
        LEGACY_TYPE_2("legacy_type_2", StructurePlacement::legacyArbitrarySaltProbabilityReducer),
        LEGACY_TYPE_3("legacy_type_3", StructurePlacement::legacyProbabilityReducerWithDouble);

        public static final Codec<StructurePlacement.FrequencyReductionMethod> CODEC = StringRepresentable.fromEnum(
            StructurePlacement.FrequencyReductionMethod::values
        );
        private final String name;
        private final StructurePlacement.FrequencyReducer reducer;

        private FrequencyReductionMethod(String param0, StructurePlacement.FrequencyReducer param1) {
            this.name = param0;
            this.reducer = param1;
        }

        public boolean shouldGenerate(long param0, int param1, int param2, int param3, float param4) {
            return this.reducer.shouldGenerate(param0, param1, param2, param3, param4);
        }

        @Override
        public String getSerializedName() {
            return this.name;
        }
    }
}
