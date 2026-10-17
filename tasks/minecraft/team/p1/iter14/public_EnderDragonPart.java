package net.minecraft.world.entity.boss;

import javax.annotation.Nullable;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ClientGamePacketListener;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityDimensions;
import net.minecraft.world.entity.Pose;
import net.minecraft.world.entity.boss.enderdragon.EnderDragon;
import net.minecraft.world.item.ItemStack;

public class EnderDragonPart extends Entity {
    public final EnderDragon parentMob;
    public final String name;
    private final EntityDimensions size;

    public EnderDragonPart(EnderDragon param0, String param1, float param2, float param3) {
        super(param0.getType(), param0.level());
        this.size = EntityDimensions.scalable(param2, param3);
        this.refreshDimensions();
        this.parentMob = param0;
        this.name = param1;
    }

    @Override
    protected void defineSynchedData() {
    }

    @Override
    protected void readAdditionalSaveData(CompoundTag param0) {
    }

    @Override
    protected void addAdditionalSaveData(CompoundTag param0) {
    }

    @Override
    public boolean isPickable() {
        return true;
    }

    @Nullable
    @Override
    public ItemStack getPickResult() {
        return this.parentMob.getPickResult();
    }

    @Override
    public boolean hurt(DamageSource param0, float param1) {
        return this.isInvulnerableTo(param0) ? false : this.parentMob.hurt(this, param0, param1);
    }

    @Override
    public boolean is(Entity param0) {
        return this == param0 || this.parentMob == param0;
    }

    @Override
    public Packet<ClientGamePacketListener> getAddEntityPacket() {
        throw new UnsupportedOperationException();
    }

    @Override
    public EntityDimensions getDimensions(Pose param0) {
        return this.size;
    }

    @Override
    public boolean shouldBeSaved() {
        return false;
    }
}
