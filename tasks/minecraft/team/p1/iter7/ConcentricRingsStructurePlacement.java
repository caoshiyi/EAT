package net.minecraft.world.level.levelgen.structure.placement;

import com.mojang.datafixers.Products.P4;
import com.mojang.datafixers.Products.P5;
import com.mojang.datafixers.Products.P9;
import com.mojang.serialization.Codec;
import com.mojang.serialization.codecs.RecordCodecBuilder;
import com.mojang.serialization.codecs.RecordCodecBuilder.Instance;
import com.mojang.serialization.codecs.RecordCodecBuilder.Mu;
import java.util.List;
import java.util.Optional;
import net.minecraft.core.HolderSet;
import net.minecraft.core.RegistryCodecs;
import net.minecraft.core.Vec3i;
import net.minecraft.core.registries.Registries;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.chunk.ChunkGeneratorStructureState;

public class ConcentricRingsStructurePlacement extends StructurePlacement {
    public static final Codec<ConcentricRingsStructurePlacement> CODEC = RecordCodecBuilder.create(
        param0 -> codec(param0).apply(param0, ConcentricRingsStructurePlacement::new)
    );
    private final int distance;
    private final int spread;
    private final int count;
    private final HolderSet<Biome> preferredBiomes;

    private static P9<Mu<ConcentricRingsStructurePlacement>, Vec3i, StructurePlacement.FrequencyReductionMethod, Float, Integer, Optional<StructurePlacement.ExclusionZone>, Integer, Integer, Integer, HolderSet<Biome>> codec(
        Instance<ConcentricRingsStructurePlacement> param0
    ) {
        P5<Mu<ConcentricRingsStructurePlacement>, Vec3i, StructurePlacement.FrequencyReductionMethod, Float, Integer, Optional<StructurePlacement.ExclusionZone>> var0 = placementCodec(
            param0
        );
        P4<Mu<ConcentricRingsStructurePlacement>, Integer, Integer, Integer, HolderSet<Biome>> var1 = param0.group(
            Codec.intRange(0, 1023).fieldOf("distance").forGetter(ConcentricRingsStructurePlacement::distance),
            Codec.intRange(0, 1023).fieldOf("spread").forGetter(ConcentricRingsStructurePlacement::spread),
            Codec.intRange(1, 4095).fieldOf("count").forGetter(ConcentricRingsStructurePlacement::count),
            RegistryCodecs.homogeneousList(Registries.BIOME).fieldOf("preferred_biomes").forGetter(ConcentricRingsStructurePlacement::preferredBiomes)
        );
        return new P9<>(var0.t1(), var0.t2(), var0.t3(), var0.t4(), var0.t5(), var1.t1(), var1.t2(), var1.t3(), var1.t4());
    }

    public ConcentricRingsStructurePlacement(
        Vec3i param0,
        StructurePlacement.FrequencyReductionMethod param1,
        float param2,
        int param3,
        Optional<StructurePlacement.ExclusionZone> param4,
        int param5,
        int param6,
        int param7,
        HolderSet<Biome> param8
    ) {
        super(param0, param1, param2, param3, param4);
        this.distance = param5;
        this.spread = param6;
        this.count = param7;
        this.preferredBiomes = param8;
    }

    public ConcentricRingsStructurePlacement(int param0, int param1, int param2, HolderSet<Biome> param3) {
        this(Vec3i.ZERO, StructurePlacement.FrequencyReductionMethod.DEFAULT, 1.0F, 0, Optional.empty(), param0, param1, param2, param3);
    }

    public int distance() {
        return this.distance;
    }

    public int spread() {
        return this.spread;
    }

    public int count() {
        return this.count;
    }

    public HolderSet<Biome> preferredBiomes() {
        return this.preferredBiomes;
    }

    @Override
    protected boolean isPlacementChunk(ChunkGeneratorStructureState param0, int param1, int param2) {
        List<ChunkPos> var0 = param0.getRingPositionsFor(this);
        return var0 == null ? false : var0.contains(new ChunkPos(param1, param2));
    }

    @Override
    public StructurePlacementType<?> type() {
        return StructurePlacementType.CONCENTRIC_RINGS;
    }
}
