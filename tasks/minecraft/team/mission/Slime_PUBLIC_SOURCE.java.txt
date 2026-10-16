package net.minecraft.world.entity.monster;

import com.google.common.annotations.VisibleForTesting;
import java.util.EnumSet;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleOptions;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.chat.Component;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.tags.BiomeTags;
import net.minecraft.util.Mth;
import net.minecraft.util.RandomSource;
import net.minecraft.world.Difficulty;
import net.minecraft.world.DifficultyInstance;
import net.minecraft.world.damagesource.DamageSource;
import net.minecraft.world.effect.MobEffects;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityDimensions;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.MobSpawnType;
import net.minecraft.world.entity.Pose;
import net.minecraft.world.entity.SpawnGroupData;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.ai.control.MoveControl;
import net.minecraft.world.entity.ai.goal.Goal;
import net.minecraft.world.entity.ai.goal.target.NearestAttackableTargetGoal;
import net.minecraft.world.entity.animal.IronGolem;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.ChunkPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelAccessor;
import net.minecraft.world.level.ServerLevelAccessor;
import net.minecraft.world.level.WorldGenLevel;
import net.minecraft.world.level.levelgen.WorldgenRandom;
import net.minecraft.world.phys.Vec3;
import org.joml.Vector3f;

public class Slime extends Mob implements Enemy {
    private static final EntityDataAccessor<Integer> ID_SIZE = SynchedEntityData.defineId(Slime.class, EntityDataSerializers.INT);
    public static final int MIN_SIZE = 1;
    public static final int MAX_SIZE = 127;
    public float targetSquish;
    public float squish;
    public float oSquish;
    private boolean wasOnGround;

    public Slime(EntityType<? extends Slime> param0, Level param1) {
        super(param0, param1);
        this.fixupDimensions();
        this.moveControl = new Slime.SlimeMoveControl(this);
    }

    @Override
    protected void registerGoals() {
        this.goalSelector.addGoal(1, new Slime.SlimeFloatGoal(this));
        this.goalSelector.addGoal(2, new Slime.SlimeAttackGoal(this));
        this.goalSelector.addGoal(3, new Slime.SlimeRandomDirectionGoal(this));
        this.goalSelector.addGoal(5, new Slime.SlimeKeepOnJumpingGoal(this));
        this.targetSelector
            .addGoal(1, new NearestAttackableTargetGoal<>(this, Player.class, 10, true, false, param0 -> Math.abs(param0.getY() - this.getY()) <= 4.0));
        this.targetSelector.addGoal(3, new NearestAttackableTargetGoal<>(this, IronGolem.class, true));
    }

    @Override
    public SoundSource getSoundSource() {
        return SoundSource.HOSTILE;
    }

    @Override
    protected void defineSynchedData() {
        super.defineSynchedData();
        this.entityData.define(ID_SIZE, 1);
    }

    @VisibleForTesting
    public void setSize(int param0, boolean param1) {
        int var0 = Mth.clamp(param0, 1, 127);
        this.entityData.set(ID_SIZE, var0);
        this.reapplyPosition();
        this.refreshDimensions();
        this.getAttribute(Attributes.MAX_HEALTH).setBaseValue((double)(var0 * var0));
        this.getAttribute(Attributes.MOVEMENT_SPEED).setBaseValue((double)(0.2F + 0.1F * (float)var0));
        this.getAttribute(Attributes.ATTACK_DAMAGE).setBaseValue((double)var0);
        if (param1) {
            this.setHealth(this.getMaxHealth());
        }

        this.xpReward = var0;
    }

    public int getSize() {
        return this.entityData.get(ID_SIZE);
    }

    @Override
    public void addAdditionalSaveData(CompoundTag param0) {
        super.addAdditionalSaveData(param0);
        param0.putInt("Size", this.getSize() - 1);
        param0.putBoolean("wasOnGround", this.wasOnGround);
    }

    @Override
    public void readAdditionalSaveData(CompoundTag param0) {
        this.setSize(param0.getInt("Size") + 1, false);
        super.readAdditionalSaveData(param0);
        this.wasOnGround = param0.getBoolean("wasOnGround");
    }

    public boolean isTiny() {
        return this.getSize() <= 1;
    }

    protected ParticleOptions getParticleType() {
        return ParticleTypes.ITEM_SLIME;
    }

    @Override
    protected boolean shouldDespawnInPeaceful() {
        return this.getSize() > 0;
    }

    @Override
    public void tick() {
        this.squish += (this.targetSquish - this.squish) * 0.5F;
        this.oSquish = this.squish;
        super.tick();
        if (this.onGround() && !this.wasOnGround) {
            int var0 = this.getSize();

            for(int var1 = 0; var1 < var0 * 8; ++var1) {
                float var2 = this.random.nextFloat() * (float) (Math.PI * 2);
                float var3 = this.random.nextFloat() * 0.5F + 0.5F;
                float var4 = Mth.sin(var2) * (float)var0 * 0.5F * var3;
                float var5 = Mth.cos(var2) * (float)var0 * 0.5F * var3;
                this.level().addParticle(this.getParticleType(), this.getX() + (double)var4, this.getY(), this.getZ() + (double)var5, 0.0, 0.0, 0.0);
            }

            this.playSound(this.getSquishSound(), this.getSoundVolume(), ((this.random.nextFloat() - this.random.nextFloat()) * 0.2F + 1.0F) / 0.8F);
            this.targetSquish = -0.5F;
        } else if (!this.onGround() && this.wasOnGround) {
            this.targetSquish = 1.0F;
        }

        this.wasOnGround = this.onGround();
        this.decreaseSquish();
    }

    protected void decreaseSquish() {
        this.targetSquish *= 0.6F;
    }

    protected int getJumpDelay() {
        return this.random.nextInt(20) + 10;
    }

    @Override
    public void refreshDimensions() {
        double var0 = this.getX();
        double var1 = this.getY();
        double var2 = this.getZ();
        super.refreshDimensions();
        this.setPos(var0, var1, var2);
    }

    @Override
    public void onSyncedDataUpdated(EntityDataAccessor<?> param0) {
        if (ID_SIZE.equals(param0)) {
            this.refreshDimensions();
            this.setYRot(this.yHeadRot);
            this.yBodyRot = this.yHeadRot;
            if (this.isInWater() && this.random.nextInt(20) == 0) {
                this.doWaterSplashEffect();
            }
        }

        super.onSyncedDataUpdated(param0);
    }

    @Override
    public EntityType<? extends Slime> getType() {
        return super.getType();
    }

    @Override
    public void remove(Entity.RemovalReason param0) {
        int var0 = this.getSize();
        if (!this.level().isClientSide && var0 > 1 && this.isDeadOrDying()) {
            Component var1 = this.getCustomName();
            boolean var2 = this.isNoAi();
            float var3 = (float)var0 / 4.0F;
            int var4 = var0 / 2;
            int var5 = 2 + this.random.nextInt(3);

            for(int var6 = 0; var6 < var5; ++var6) {
                float var7 = ((float)(var6 % 2) - 0.5F) * var3;
                float var8 = ((float)(var6 / 2) - 0.5F) * var3;
                Slime var9 = this.getType().create(this.level());
                if (var9 != null) {
                    if (this.isPersistenceRequired()) {
                        var9.setPersistenceRequired();
                    }

                    var9.setCustomName(var1);
                    var9.setNoAi(var2);
                    var9.setInvulnerable(this.isInvulnerable());
                    var9.setSize(var4, true);
                    var9.moveTo(this.getX() + (double)var7, this.getY() + 0.5, this.getZ() + (double)var8, this.random.nextFloat() * 360.0F, 0.0F);
                    this.level().addFreshEntity(var9);
                }
            }
        }

        super.remove(param0);
    }

    @Override
    public void push(Entity param0) {
        super.push(param0);
        if (param0 instanceof IronGolem && this.isDealsDamage()) {
            this.dealDamage((LivingEntity)param0);
        }

    }

    @Override
    public void playerTouch(Player param0) {
        if (this.isDealsDamage()) {
            this.dealDamage(param0);
        }

    }

    protected void dealDamage(LivingEntity param0) {
        if (this.isAlive()) {
            int var0 = this.getSize();
            if (this.distanceToSqr(param0) < 0.6 * (double)var0 * 0.6 * (double)var0
                && this.hasLineOfSight(param0)
                && param0.hurt(this.damageSources().mobAttack(this), this.getAttackDamage())) {
                this.playSound(SoundEvents.SLIME_ATTACK, 1.0F, (this.random.nextFloat() - this.random.nextFloat()) * 0.2F + 1.0F);
                this.doEnchantDamageEffects(this, param0);
            }
        }

    }

    @Override
    protected float getStandingEyeHeight(Pose param0, EntityDimensions param1) {
        return 0.625F * param1.height;
    }

    @Override
    protected Vector3f getPassengerAttachmentPoint(Entity param0, EntityDimensions param1, float param2) {
        return new Vector3f(0.0F, param1.height - 0.015625F * (float)this.getSize() * param2, 0.0F);
    }

    protected boolean isDealsDamage() {
        return !this.isTiny() && this.isEffectiveAi();
    }

    protected float getAttackDamage() {
        return (float)this.getAttributeValue(Attributes.ATTACK_DAMAGE);
    }

    @Override
    protected SoundEvent getHurtSound(DamageSource param0) {
        return this.isTiny() ? SoundEvents.SLIME_HURT_SMALL : SoundEvents.SLIME_HURT;
    }

    @Override
    protected SoundEvent getDeathSound() {
        return this.isTiny() ? SoundEvents.SLIME_DEATH_SMALL : SoundEvents.SLIME_DEATH;
    }

    protected SoundEvent getSquishSound() {
        return this.isTiny() ? SoundEvents.SLIME_SQUISH_SMALL : SoundEvents.SLIME_SQUISH;
    }

    public static boolean checkSlimeSpawnRules(EntityType<Slime> param0, LevelAccessor param1, MobSpawnType param2, BlockPos param3, RandomSource param4) {
        if (MobSpawnType.isSpawner(param2)) {
            return checkMobSpawnRules(param0, param1, param2, param3, param4);
        } else {
            if (param1.getDifficulty() != Difficulty.PEACEFUL) {
                if (param2 == MobSpawnType.SPAWNER) {
                    return checkMobSpawnRules(param0, param1, param2, param3, param4);
                }

                if (param1.getBiome(param3).is(BiomeTags.ALLOWS_SURFACE_SLIME_SPAWNS)
                    && param3.getY() > 50
                    && param3.getY() < 70
                    && param4.nextFloat() < 0.5F
                    && param4.nextFloat() < param1.getMoonBrightness()
                    && param1.getMaxLocalRawBrightness(param3) <= param4.nextInt(8)) {
                    return checkMobSpawnRules(param0, param1, param2, param3, param4);
                }

                if (!(param1 instanceof WorldGenLevel)) {
                    return false;
                }

                ChunkPos var0 = new ChunkPos(param3);
                boolean var1 = WorldgenRandom.seedSlimeChunk(var0.x, var0.z, ((WorldGenLevel)param1).getSeed(), 987234911L).nextInt(10) == 0;
                if (param4.nextInt(10) == 0 && var1 && param3.getY() < 40) {
                    return checkMobSpawnRules(param0, param1, param2, param3, param4);
                }
            }

            return false;
        }
    }

    @Override
    protected float getSoundVolume() {
        return 0.4F * (float)this.getSize();
    }

    @Override
    public int getMaxHeadXRot() {
        return 0;
    }

    protected boolean doPlayJumpSound() {
        return this.getSize() > 0;
    }

    @Override
    protected void jumpFromGround() {
        Vec3 var0 = this.getDeltaMovement();
        this.setDeltaMovement(var0.x, (double)this.getJumpPower(), var0.z);
        this.hasImpulse = true;
    }

    @Nullable
    @Override
    public SpawnGroupData finalizeSpawn(
        ServerLevelAccessor param0, DifficultyInstance param1, MobSpawnType param2, @Nullable SpawnGroupData param3, @Nullable CompoundTag param4
    ) {
        RandomSource var0 = param0.getRandom();
        int var1 = var0.nextInt(3);
        if (var1 < 2 && var0.nextFloat() < 0.5F * param1.getSpecialMultiplier()) {
            ++var1;
        }

        int var2 = 1 << var1;
        this.setSize(var2, true);
        return super.finalizeSpawn(param0, param1, param2, param3, param4);
    }

    float getSoundPitch() {
        float var0 = this.isTiny() ? 1.4F : 0.8F;
        return ((this.random.nextFloat() - this.random.nextFloat()) * 0.2F + 1.0F) * var0;
    }

    protected SoundEvent getJumpSound() {
        return this.isTiny() ? SoundEvents.SLIME_JUMP_SMALL : SoundEvents.SLIME_JUMP;
    }

    @Override
    public EntityDimensions getDimensions(Pose param0) {
        return super.getDimensions(param0).scale(0.255F * (float)this.getSize());
    }

    static class SlimeAttackGoal extends Goal {
        private final Slime slime;
        private int growTiredTimer;

        public SlimeAttackGoal(Slime param0) {
            this.slime = param0;
            this.setFlags(EnumSet.of(Goal.Flag.LOOK));
        }

        @Override
        public boolean canUse() {
            LivingEntity var0 = this.slime.getTarget();
            if (var0 == null) {
                return false;
            } else {
                return !this.slime.canAttack(var0) ? false : this.slime.getMoveControl() instanceof Slime.SlimeMoveControl;
            }
        }

        @Override
        public void start() {
            this.growTiredTimer = reducedTickDelay(300);
            super.start();
        }

        @Override
        public boolean canContinueToUse() {
            LivingEntity var0 = this.slime.getTarget();
            if (var0 == null) {
                return false;
            } else if (!this.slime.canAttack(var0)) {
                return false;
            } else {
                return --this.growTiredTimer > 0;
            }
        }

        @Override
        public boolean requiresUpdateEveryTick() {
            return true;
        }

        @Override
        public void tick() {
            LivingEntity var0 = this.slime.getTarget();
            if (var0 != null) {
                this.slime.lookAt(var0, 10.0F, 10.0F);
            }

            MoveControl var3 = this.slime.getMoveControl();
            if (var3 instanceof Slime.SlimeMoveControl var1) {
                var1.setDirection(this.slime.getYRot(), this.slime.isDealsDamage());
            }

        }
    }

    static class SlimeFloatGoal extends Goal {
        private final Slime slime;

        public SlimeFloatGoal(Slime param0) {
            this.slime = param0;
            this.setFlags(EnumSet.of(Goal.Flag.JUMP, Goal.Flag.MOVE));
            param0.getNavigation().setCanFloat(true);
        }

        @Override
        public boolean canUse() {
            return (this.slime.isInWater() || this.slime.isInLava()) && this.slime.getMoveControl() instanceof Slime.SlimeMoveControl;
        }

        @Override
        public boolean requiresUpdateEveryTick() {
            return true;
        }

        @Override
        public void tick() {
            if (this.slime.getRandom().nextFloat() < 0.8F) {
                this.slime.getJumpControl().jump();
            }

            MoveControl var2 = this.slime.getMoveControl();
            if (var2 instanceof Slime.SlimeMoveControl var0) {
                var0.setWantedMovement(1.2);
            }

        }
    }

    static class SlimeKeepOnJumpingGoal extends Goal {
        private final Slime slime;

        public SlimeKeepOnJumpingGoal(Slime param0) {
            this.slime = param0;
            this.setFlags(EnumSet.of(Goal.Flag.JUMP, Goal.Flag.MOVE));
        }

        @Override
        public boolean canUse() {
            return !this.slime.isPassenger();
        }

        @Override
        public void tick() {
            MoveControl var2 = this.slime.getMoveControl();
            if (var2 instanceof Slime.SlimeMoveControl var0) {
                var0.setWantedMovement(1.0);
            }

        }
    }

    static class SlimeMoveControl extends MoveControl {
        private float yRot;
        private int jumpDelay;
        private final Slime slime;
        private boolean isAggressive;

        public SlimeMoveControl(Slime param0) {
            super(param0);
            this.slime = param0;
            this.yRot = 180.0F * param0.getYRot() / (float) Math.PI;
        }

        public void setDirection(float param0, boolean param1) {
            this.yRot = param0;
            this.isAggressive = param1;
        }

        public void setWantedMovement(double param0) {
            this.speedModifier = param0;
            this.operation = MoveControl.Operation.MOVE_TO;
        }

        @Override
        public void tick() {
            this.mob.setYRot(this.rotlerp(this.mob.getYRot(), this.yRot, 90.0F));
            this.mob.yHeadRot = this.mob.getYRot();
            this.mob.yBodyRot = this.mob.getYRot();
            if (this.operation != MoveControl.Operation.MOVE_TO) {
                this.mob.setZza(0.0F);
            } else {
                this.operation = MoveControl.Operation.WAIT;
                if (this.mob.onGround()) {
                    this.mob.setSpeed((float)(this.speedModifier * this.mob.getAttributeValue(Attributes.MOVEMENT_SPEED)));
                    if (this.jumpDelay-- <= 0) {
                        this.jumpDelay = this.slime.getJumpDelay();
                        if (this.isAggressive) {
                            this.jumpDelay /= 3;
                        }

                        this.slime.getJumpControl().jump();
                        if (this.slime.doPlayJumpSound()) {
                            this.slime.playSound(this.slime.getJumpSound(), this.slime.getSoundVolume(), this.slime.getSoundPitch());
                        }
                    } else {
                        this.slime.xxa = 0.0F;
                        this.slime.zza = 0.0F;
                        this.mob.setSpeed(0.0F);
                    }
                } else {
                    this.mob.setSpeed((float)(this.speedModifier * this.mob.getAttributeValue(Attributes.MOVEMENT_SPEED)));
                }

            }
        }
    }

    static class SlimeRandomDirectionGoal extends Goal {
        private final Slime slime;
        private float chosenDegrees;
        private int nextRandomizeTime;

        public SlimeRandomDirectionGoal(Slime param0) {
            this.slime = param0;
            this.setFlags(EnumSet.of(Goal.Flag.LOOK));
        }

        @Override
        public boolean canUse() {
            return this.slime.getTarget() == null
                && (this.slime.onGround() || this.slime.isInWater() || this.slime.isInLava() || this.slime.hasEffect(MobEffects.LEVITATION))
                && this.slime.getMoveControl() instanceof Slime.SlimeMoveControl;
        }

        @Override
        public void tick() {
            if (--this.nextRandomizeTime <= 0) {
                this.nextRandomizeTime = this.adjustedTickDelay(40 + this.slime.getRandom().nextInt(60));
                this.chosenDegrees = (float)this.slime.getRandom().nextInt(360);
            }

            MoveControl var2 = this.slime.getMoveControl();
            if (var2 instanceof Slime.SlimeMoveControl var0) {
                var0.setDirection(this.chosenDegrees, false);
            }

        }
    }
}
