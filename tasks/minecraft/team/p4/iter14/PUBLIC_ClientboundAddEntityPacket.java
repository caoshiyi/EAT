package net.minecraft.network.protocol.game;

import java.util.UUID;
import net.minecraft.core.BlockPos;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraft.network.protocol.Packet;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.phys.Vec3;

public class ClientboundAddEntityPacket implements Packet<ClientGamePacketListener> {
    private static final double MAGICAL_QUANTIZATION = 8000.0;
    private static final double LIMIT = 3.9;
    private final int id;
    private final UUID uuid;
    private final EntityType<?> type;
    private final double x;
    private final double y;
    private final double z;
    private final int xa;
    private final int ya;
    private final int za;
    private final byte xRot;
    private final byte yRot;
    private final byte yHeadRot;
    private final int data;

    public ClientboundAddEntityPacket(Entity param0) {
        this(param0, 0);
    }

    public ClientboundAddEntityPacket(Entity param0, int param1) {
        this(
            param0.getId(),
            param0.getUUID(),
            param0.getX(),
            param0.getY(),
            param0.getZ(),
            param0.getXRot(),
            param0.getYRot(),
            param0.getType(),
            param1,
            param0.getDeltaMovement(),
            (double)param0.getYHeadRot()
        );
    }

    public ClientboundAddEntityPacket(Entity param0, int param1, BlockPos param2) {
        this(
            param0.getId(),
            param0.getUUID(),
            (double)param2.getX(),
            (double)param2.getY(),
            (double)param2.getZ(),
            param0.getXRot(),
            param0.getYRot(),
            param0.getType(),
            param1,
            param0.getDeltaMovement(),
            (double)param0.getYHeadRot()
        );
    }

    public ClientboundAddEntityPacket(
        int param0,
        UUID param1,
        double param2,
        double param3,
        double param4,
        float param5,
        float param6,
        EntityType<?> param7,
        int param8,
        Vec3 param9,
        double param10
    ) {
        this.id = param0;
        this.uuid = param1;
        this.x = param2;
        this.y = param3;
        this.z = param4;
        this.xRot = (byte)Mth.floor(param5 * 256.0F / 360.0F);
        this.yRot = (byte)Mth.floor(param6 * 256.0F / 360.0F);
        this.yHeadRot = (byte)Mth.floor(param10 * 256.0 / 360.0);
        this.type = param7;
        this.data = param8;
        this.xa = (int)(Mth.clamp(param9.x, -3.9, 3.9) * 8000.0);
        this.ya = (int)(Mth.clamp(param9.y, -3.9, 3.9) * 8000.0);
        this.za = (int)(Mth.clamp(param9.z, -3.9, 3.9) * 8000.0);
    }

    public ClientboundAddEntityPacket(FriendlyByteBuf param0) {
        this.id = param0.readVarInt();
        this.uuid = param0.readUUID();
        this.type = param0.readById(BuiltInRegistries.ENTITY_TYPE);
        this.x = param0.readDouble();
        this.y = param0.readDouble();
        this.z = param0.readDouble();
        this.xRot = param0.readByte();
        this.yRot = param0.readByte();
        this.yHeadRot = param0.readByte();
        this.data = param0.readVarInt();
        this.xa = param0.readShort();
        this.ya = param0.readShort();
        this.za = param0.readShort();
    }

    @Override
    public void write(FriendlyByteBuf param0) {
        param0.writeVarInt(this.id);
        param0.writeUUID(this.uuid);
        param0.writeId(BuiltInRegistries.ENTITY_TYPE, this.type);
        param0.writeDouble(this.x);
        param0.writeDouble(this.y);
        param0.writeDouble(this.z);
        param0.writeByte(this.xRot);
        param0.writeByte(this.yRot);
        param0.writeByte(this.yHeadRot);
        param0.writeVarInt(this.data);
        param0.writeShort(this.xa);
        param0.writeShort(this.ya);
        param0.writeShort(this.za);
    }

    public void handle(ClientGamePacketListener param0) {
        param0.handleAddEntity(this);
    }

    public int getId() {
        return this.id;
    }

    public UUID getUUID() {
        return this.uuid;
    }

    public EntityType<?> getType() {
        return this.type;
    }

    public double getX() {
        return this.x;
    }

    public double getY() {
        return this.y;
    }

    public double getZ() {
        return this.z;
    }

    public double getXa() {
        return (double)this.xa / 8000.0;
    }

    public double getYa() {
        return (double)this.ya / 8000.0;
    }

    public double getZa() {
        return (double)this.za / 8000.0;
    }

    public float getXRot() {
        return (float)(this.xRot * 360) / 256.0F;
    }

    public float getYRot() {
        return (float)(this.yRot * 360) / 256.0F;
    }

    public float getYHeadRot() {
        return (float)(this.yHeadRot * 360) / 256.0F;
    }

    public int getData() {
        return this.data;
    }
}
