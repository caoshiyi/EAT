package net.minecraft.world.entity.monster;

import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleOptions;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.tags.FluidTags;
import net.minecraft.tags.TagKey;
import net.minecraft.util.RandomSource;
import net.minecraft.world.Difficulty;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.MobSpawnType;
import net.minecraft.world.entity.ai.attributes.AttributeSupplier;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelAccessor;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.material.Fluid;
import net.minecraft.world.phys.Vec3;

public class MagmaCube extends Slime {
    public MagmaCube(EntityType<? extends MagmaCube> param0, Level param1) {
        super(param0, param1);
    }

    public static AttributeSupplier.Builder createAttributes() {
        return Monster.createMonsterAttributes().add(Attributes.MOVEMENT_SPEED, 0.2F);
    }

    public static boolean checkMagmaCubeSpawnRules(
        EntityType<MagmaCube> param0, LevelAccessor param1, MobSpawnType param2, BlockPos param3, RandomSource param4
    ) {
        return param1.getDifficulty() != Difficulty.PEACEFUL;
    }

    @Override
    public boolean checkSpawnObstruction(LevelReader param0) {
        return param0.isUnobstructed(this) && !param0.containsAnyLiquid(this.getBoundingBox());
    }

    @Override
    public void setSize(int param0, boolean param1) {
        super.setSize(param0, param1);
        this.getAttribute(Attributes.ARMOR).setBaseValue((double)(param0 * 3));
    }

    @Override
    public float getLightLevelDependentMagicValue() {
        return 1.0F;
    }

    @Override
    protected ParticleOptions getParticleType() {
        return ParticleTypes.FLAME;
    }

    @Override
    public boolean isOnFire() {
        return false;
    }

    @Override
    protected int getJumpDelay() {
        return super.getJumpDelay() * 4;
    }

    @Override
    protected void decreaseSquish() {
        this.targetSquish *= 0.9F;
    }

    @Override
    protected void jumpFromGround() {
        Vec3 var0 = this.getDeltaMovement();
        float var1 = (float)this.getSize() * 0.1F;
        this.setDeltaMovement(var0.x, (double)(this.getJumpPower() + var1), var0.z);
        this.hasImpulse = true;
    }

    @Override
    protected void jumpInLiquid(TagKey<Fluid> param0) {
        if (param0 == FluidTags.LAVA) {
            Vec3 var0 = this.getDeltaMovement();
            this.setDeltaMovement(var0.x, (double)(0.22F + (float)this.getSize() * 0.05F), var0.z);
            this.hasImpulse = true;
        } else {
            super.jumpInLiquid(param0);
        }

    }

    @Override
    protected boolean isDealsDamage() {
        return this.isEffectiveAi();
    }

    @Override
    protected float getAttackDamage() {
        return super.getAttackDamage() + 2.0F;
    }

    @Override
    protected SoundEvent getHurtSound(DamageSource param0) {
        return this.isTiny() ? SoundEvents.MAGMA_CUBE_HURT_SMALL : SoundEvents.MAGMA_CUBE_HURT;
    }

    @Override
    protected SoundEvent getDeathSound() {
        return this.isTiny() ? SoundEvents.MAGMA_CUBE_DEATH_SMALL : SoundEvents.MAGMA_CUBE_DEATH;
    }

    @Override
    protected SoundEvent getSquishSound() {
        return this.isTiny() ? SoundEvents.MAGMA_CUBE_SQUISH_SMALL : SoundEvents.MAGMA_CUBE_SQUISH;
    }

    @Override
    protected SoundEvent getJumpSound() {
        return SoundEvents.MAGMA_CUBE_JUMP;
    }
}
