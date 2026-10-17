package net.minecraft.world.entity.boss.enderdragon;

import java.util.Optional;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.NbtUtils;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.DamageTypeTags;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.BaseFireBlock;
import net.minecraft.world.level.dimension.end.EndDragonFight;

public class EndCrystal extends Entity {
    private static final EntityDataAccessor<Optional<BlockPos>> DATA_BEAM_TARGET = SynchedEntityData.defineId(
        EndCrystal.class, EntityDataSerializers.OPTIONAL_BLOCK_POS
    );
    private static final EntityDataAccessor<Boolean> DATA_SHOW_BOTTOM = SynchedEntityData.defineId(EndCrystal.class, EntityDataSerializers.BOOLEAN);
    public int time;

    public EndCrystal(EntityType<? extends EndCrystal> param0, Level param1) {
        super(param0, param1);
        this.blocksBuilding = true;
        this.time = this.random.nextInt(100000);
    }

    public EndCrystal(Level param0, double param1, double param2, double param3) {
        this(EntityType.END_CRYSTAL, param0);
        this.setPos(param1, param2, param3);
    }

    @Override
    protected Entity.MovementEmission getMovementEmission() {
        return Entity.MovementEmission.NONE;
    }

    @Override
    protected void defineSynchedData() {
        this.getEntityData().define(DATA_BEAM_TARGET, Optional.empty());
        this.getEntityData().define(DATA_SHOW_BOTTOM, true);
    }

    @Override
    public void tick() {
        ++this.time;
        if (this.level() instanceof ServerLevel) {
            BlockPos var0 = this.blockPosition();
            if (((ServerLevel)this.level()).getDragonFight() != null && this.level().getBlockState(var0).isAir()) {
                this.level().setBlockAndUpdate(var0, BaseFireBlock.getState(this.level(), var0));
            }
        }

    }

    @Override
    protected void addAdditionalSaveData(CompoundTag param0) {
        if (this.getBeamTarget() != null) {
            param0.put("BeamTarget", NbtUtils.writeBlockPos(this.getBeamTarget()));
        }

        param0.putBoolean("ShowBottom", this.showsBottom());
    }

    @Override
    protected void readAdditionalSaveData(CompoundTag param0) {
        if (param0.contains("BeamTarget", 10)) {
            this.setBeamTarget(NbtUtils.readBlockPos(param0.getCompound("BeamTarget")));
        }

        if (param0.contains("ShowBottom", 1)) {
            this.setShowBottom(param0.getBoolean("ShowBottom"));
        }

    }

    @Override
    public boolean isPickable() {
        return true;
    }

    @Override
    public boolean hurt(DamageSource param0, float param1) {
        if (this.isInvulnerableTo(param0)) {
            return false;
        } else if (param0.getEntity() instanceof EnderDragon) {
            return false;
        } else {
            if (!this.isRemoved() && !this.level().isClientSide) {
                this.remove(Entity.RemovalReason.KILLED);
                if (!param0.is(DamageTypeTags.IS_EXPLOSION)) {
                    DamageSource var0 = param0.getEntity() != null ? this.damageSources().explosion(this, param0.getEntity()) : null;
                    this.level().explode(this, var0, null, this.getX(), this.getY(), this.getZ(), 6.0F, false, Level.ExplosionInteraction.BLOCK);
                }

                this.onDestroyedBy(param0);
            }

            return true;
        }
    }

    @Override
    public void kill() {
        this.onDestroyedBy(this.damageSources().generic());
        super.kill();
    }

    private void onDestroyedBy(DamageSource param0) {
        if (this.level() instanceof ServerLevel) {
            EndDragonFight var0 = ((ServerLevel)this.level()).getDragonFight();
            if (var0 != null) {
                var0.onCrystalDestroyed(this, param0);
            }
        }

    }

    public void setBeamTarget(@Nullable BlockPos param0) {
        this.getEntityData().set(DATA_BEAM_TARGET, Optional.ofNullable(param0));
    }

    @Nullable
    public BlockPos getBeamTarget() {
        return this.getEntityData().get(DATA_BEAM_TARGET).orElse(null);
    }

    public void setShowBottom(boolean param0) {
        this.getEntityData().set(DATA_SHOW_BOTTOM, param0);
    }

    public boolean showsBottom() {
        return this.getEntityData().get(DATA_SHOW_BOTTOM);
    }

    @Override
    public boolean shouldRenderAtSqrDistance(double param0) {
        return super.shouldRenderAtSqrDistance(param0) || this.getBeamTarget() != null;
    }

    @Override
    public ItemStack getPickResult() {
        return new ItemStack(Items.END_CRYSTAL);
    }
}
