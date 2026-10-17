package net.minecraft.world.entity.vehicle;

import com.google.common.collect.Lists;
import java.util.List;
import java.util.function.IntFunction;
import javax.annotation.Nullable;
import net.minecraft.BlockUtil;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.chat.Component;
import net.minecraft.network.protocol.game.ServerboundPaddleBoatPacket;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.sounds.SoundEvent;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.tags.EntityTypeTags;
import net.minecraft.tags.FluidTags;
import net.minecraft.util.ByIdMap;
import net.minecraft.util.Mth;
import net.minecraft.util.StringRepresentable;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityDimensions;
import net.minecraft.world.entity.EntitySelector;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.MoverType;
import net.minecraft.world.entity.Pose;
import net.minecraft.world.entity.VariantHolder;
import net.minecraft.world.entity.animal.Animal;
import net.minecraft.world.entity.animal.WaterAnimal;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.GameRules;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.WaterlilyBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.gameevent.GameEvent;
import net.minecraft.world.level.material.FluidState;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.Vec3;
import net.minecraft.world.phys.shapes.BooleanOp;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;
import org.joml.Vector3f;

public class Boat extends VehicleEntity implements VariantHolder<Boat.Type> {
    private static final EntityDataAccessor<Integer> DATA_ID_TYPE = SynchedEntityData.defineId(Boat.class, EntityDataSerializers.INT);
    private static final EntityDataAccessor<Boolean> DATA_ID_PADDLE_LEFT = SynchedEntityData.defineId(Boat.class, EntityDataSerializers.BOOLEAN);
    private static final EntityDataAccessor<Boolean> DATA_ID_PADDLE_RIGHT = SynchedEntityData.defineId(Boat.class, EntityDataSerializers.BOOLEAN);
    private static final EntityDataAccessor<Integer> DATA_ID_BUBBLE_TIME = SynchedEntityData.defineId(Boat.class, EntityDataSerializers.INT);
    public static final int PADDLE_LEFT = 0;
    public static final int PADDLE_RIGHT = 1;
    private static final int TIME_TO_EJECT = 60;
    private static final float PADDLE_SPEED = (float) (Math.PI / 8);
    public static final double PADDLE_SOUND_TIME = (float) (Math.PI / 4);
    public static final int BUBBLE_TIME = 60;
    private final float[] paddlePositions = new float[2];
    private float invFriction;
    private float outOfControlTicks;
    private float deltaRotation;
    private int lerpSteps;
    private double lerpX;
    private double lerpY;
    private double lerpZ;
    private double lerpYRot;
    private double lerpXRot;
    private boolean inputLeft;
    private boolean inputRight;
    private boolean inputUp;
    private boolean inputDown;
    private double waterLevel;
    private float landFriction;
    private Boat.Status status;
    private Boat.Status oldStatus;
    private double lastYd;
    private boolean isAboveBubbleColumn;
    private boolean bubbleColumnDirectionIsDown;
    private float bubbleMultiplier;
    private float bubbleAngle;
    private float bubbleAngleO;

    public Boat(EntityType<? extends Boat> param0, Level param1) {
        super(param0, param1);
        this.blocksBuilding = true;
    }

    public Boat(Level param0, double param1, double param2, double param3) {
        this(EntityType.BOAT, param0);
        this.setPos(param1, param2, param3);
        this.xo = param1;
        this.yo = param2;
        this.zo = param3;
    }

    @Override
    protected float getEyeHeight(Pose param0, EntityDimensions param1) {
        return param1.height;
    }

    @Override
    protected Entity.MovementEmission getMovementEmission() {
        return Entity.MovementEmission.EVENTS;
    }

    @Override
    protected void defineSynchedData() {
        super.defineSynchedData();
        this.entityData.define(DATA_ID_TYPE, Boat.Type.OAK.ordinal());
        this.entityData.define(DATA_ID_PADDLE_LEFT, false);
        this.entityData.define(DATA_ID_PADDLE_RIGHT, false);
        this.entityData.define(DATA_ID_BUBBLE_TIME, 0);
    }

    @Override
    public boolean canCollideWith(Entity param0) {
        return canVehicleCollide(this, param0);
    }

    public static boolean canVehicleCollide(Entity param0, Entity param1) {
        return (param1.canBeCollidedWith() || param1.isPushable()) && !param0.isPassengerOfSameVehicle(param1);
    }

    @Override
    public boolean canBeCollidedWith() {
        return true;
    }

    @Override
    public boolean isPushable() {
        return true;
    }

    @Override
    protected Vec3 getRelativePortalPosition(Direction.Axis param0, BlockUtil.FoundRectangle param1) {
        return LivingEntity.resetForwardDirectionOfRelativePortalPosition(super.getRelativePortalPosition(param0, param1));
    }

    @Override
    protected Vector3f getPassengerAttachmentPoint(Entity param0, EntityDimensions param1, float param2) {
        float var0 = this.getSinglePassengerXOffset();
        if (this.getPassengers().size() > 1) {
            int var1 = this.getPassengers().indexOf(param0);
            if (var1 == 0) {
                var0 = 0.2F;
            } else {
                var0 = -0.6F;
            }

            if (param0 instanceof Animal) {
                var0 += 0.2F;
            }
        }

        return new Vector3f(0.0F, this.getVariant() == Boat.Type.BAMBOO ? param1.height * 0.8888889F : param1.height / 3.0F, var0);
    }

    @Override
    public void onAboveBubbleCol(boolean param0) {
        if (!this.level().isClientSide) {
            this.isAboveBubbleColumn = true;
            this.bubbleColumnDirectionIsDown = param0;
            if (this.getBubbleTime() == 0) {
                this.setBubbleTime(60);
            }
        }

        this.level()
            .addParticle(
                ParticleTypes.SPLASH,
                this.getX() + (double)this.random.nextFloat(),
                this.getY() + 0.7,
                this.getZ() + (double)this.random.nextFloat(),
                0.0,
                0.0,
                0.0
            );
        if (this.random.nextInt(20) == 0) {
            this.level()
                .playLocalSound(
                    this.getX(), this.getY(), this.getZ(), this.getSwimSplashSound(), this.getSoundSource(), 1.0F, 0.8F + 0.4F * this.random.nextFloat(), false
                );
            this.gameEvent(GameEvent.SPLASH, this.getControllingPassenger());
        }

    }

    @Override
    public void push(Entity param0) {
        if (param0 instanceof Boat) {
            if (param0.getBoundingBox().minY < this.getBoundingBox().maxY) {
                super.push(param0);
            }
        } else if (param0.getBoundingBox().minY <= this.getBoundingBox().minY) {
            super.push(param0);
        }

    }

    @Override
    public Item getDropItem() {
        return switch(this.getVariant()) {
            case SPRUCE -> Items.SPRUCE_BOAT;
            case BIRCH -> Items.BIRCH_BOAT;
            case JUNGLE -> Items.JUNGLE_BOAT;
            case ACACIA -> Items.ACACIA_BOAT;
            case CHERRY -> Items.CHERRY_BOAT;
            case DARK_OAK -> Items.DARK_OAK_BOAT;
            case MANGROVE -> Items.MANGROVE_BOAT;
            case BAMBOO -> Items.BAMBOO_RAFT;
            default -> Items.OAK_BOAT;
        };
    }

    @Override
    public void animateHurt(float param0) {
        this.setHurtDir(-this.getHurtDir());
        this.setHurtTime(10);
        this.setDamage(this.getDamage() * 11.0F);
    }

    @Override
    public boolean isPickable() {
        return !this.isRemoved();
    }

    @Override
    public void lerpTo(double param0, double param1, double param2, float param3, float param4, int param5) {
        this.lerpX = param0;
        this.lerpY = param1;
        this.lerpZ = param2;
        this.lerpYRot = (double)param3;
        this.lerpXRot = (double)param4;
        this.lerpSteps = 10;
    }

    @Override
    public double lerpTargetX() {
        return this.lerpSteps > 0 ? this.lerpX : this.getX();
    }

    @Override
    public double lerpTargetY() {
        return this.lerpSteps > 0 ? this.lerpY : this.getY();
    }

    @Override
    public double lerpTargetZ() {
        return this.lerpSteps > 0 ? this.lerpZ : this.getZ();
    }

    @Override
    public float lerpTargetXRot() {
        return this.lerpSteps > 0 ? (float)this.lerpXRot : this.getXRot();
    }

    @Override
    public float lerpTargetYRot() {
        return this.lerpSteps > 0 ? (float)this.lerpYRot : this.getYRot();
    }

    @Override
    public Direction getMotionDirection() {
        return this.getDirection().getClockWise();
    }

    @Override
    public void tick() {
        this.oldStatus = this.status;
        this.status = this.getStatus();
        if (this.status != Boat.Status.UNDER_WATER && this.status != Boat.Status.UNDER_FLOWING_WATER) {
            this.outOfControlTicks = 0.0F;
        } else {
            ++this.outOfControlTicks;
        }

        if (!this.level().isClientSide && this.outOfControlTicks >= 60.0F) {
            this.ejectPassengers();
        }

        if (this.getHurtTime() > 0) {
            this.setHurtTime(this.getHurtTime() - 1);
        }

        if (this.getDamage() > 0.0F) {
            this.setDamage(this.getDamage() - 1.0F);
        }

        super.tick();
        this.tickLerp();
        if (this.isControlledByLocalInstance()) {
            if (!(this.getFirstPassenger() instanceof Player)) {
                this.setPaddleState(false, false);
            }

            this.floatBoat();
            if (this.level().isClientSide) {
                this.controlBoat();
                this.level().sendPacketToServer(new ServerboundPaddleBoatPacket(this.getPaddleState(0), this.getPaddleState(1)));
            }

            this.move(MoverType.SELF, this.getDeltaMovement());
        } else {
            this.setDeltaMovement(Vec3.ZERO);
        }

        this.tickBubbleColumn();

        for(int var0 = 0; var0 <= 1; ++var0) {
            if (this.getPaddleState(var0)) {
                if (!this.isSilent()
                    && (double)(this.paddlePositions[var0] % (float) (Math.PI * 2)) <= (float) (Math.PI / 4)
                    && (double)((this.paddlePositions[var0] + (float) (Math.PI / 8)) % (float) (Math.PI * 2)) >= (float) (Math.PI / 4)) {
                    SoundEvent var1 = this.getPaddleSound();
                    if (var1 != null) {
                        Vec3 var2 = this.getViewVector(1.0F);
                        double var3 = var0 == 1 ? -var2.z : var2.z;
                        double var4 = var0 == 1 ? var2.x : -var2.x;
                        this.level()
                            .playSound(
                                null,
                                this.getX() + var3,
                                this.getY(),
                                this.getZ() + var4,
                                var1,
                                this.getSoundSource(),
                                1.0F,
                                0.8F + 0.4F * this.random.nextFloat()
                            );
                    }
                }

                this.paddlePositions[var0] += (float) (Math.PI / 8);
            } else {
                this.paddlePositions[var0] = 0.0F;
            }
        }

        this.checkInsideBlocks();
        List<Entity> var5 = this.level().getEntities(this, this.getBoundingBox().inflate(0.2F, -0.01F, 0.2F), EntitySelector.pushableBy(this));
        if (!var5.isEmpty()) {
            boolean var6 = !this.level().isClientSide && !(this.getControllingPassenger() instanceof Player);

            for(Entity var7 : var5) {
                if (!var7.hasPassenger(this)) {
                    if (var6
                        && this.getPassengers().size() < this.getMaxPassengers()
                        && !var7.isPassenger()
                        && this.hasEnoughSpaceFor(var7)
                        && var7 instanceof LivingEntity
                        && !(var7 instanceof WaterAnimal)
                        && !(var7 instanceof Player)) {
                        var7.startRiding(this);
                    } else {
                        this.push(var7);
                    }
                }
            }
        }

    }

    private void tickBubbleColumn() {
        if (this.level().isClientSide) {
            int var0 = this.getBubbleTime();
            if (var0 > 0) {
                this.bubbleMultiplier += 0.05F;
            } else {
                this.bubbleMultiplier -= 0.1F;
            }

            this.bubbleMultiplier = Mth.clamp(this.bubbleMultiplier, 0.0F, 1.0F);
            this.bubbleAngleO = this.bubbleAngle;
            this.bubbleAngle = 10.0F * (float)Math.sin((double)(0.5F * (float)this.level().getGameTime())) * this.bubbleMultiplier;
        } else {
            if (!this.isAboveBubbleColumn) {
                this.setBubbleTime(0);
            }

            int var1 = this.getBubbleTime();
            if (var1 > 0) {
                this.setBubbleTime(--var1);
                int var2 = 60 - var1 - 1;
                if (var2 > 0 && var1 == 0) {
                    this.setBubbleTime(0);
                    Vec3 var3 = this.getDeltaMovement();
                    if (this.bubbleColumnDirectionIsDown) {
                        this.setDeltaMovement(var3.add(0.0, -0.7, 0.0));
                        this.ejectPassengers();
                    } else {
                        this.setDeltaMovement(var3.x, this.hasPassenger(param0 -> param0 instanceof Player) ? 2.7 : 0.6, var3.z);
                    }
                }

                this.isAboveBubbleColumn = false;
            }
        }

    }

    @Nullable
    protected SoundEvent getPaddleSound() {
        switch(this.getStatus()) {
            case IN_WATER:
            case UNDER_WATER:
            case UNDER_FLOWING_WATER:
                return SoundEvents.BOAT_PADDLE_WATER;
            case ON_LAND:
                return SoundEvents.BOAT_PADDLE_LAND;
            case IN_AIR:
            default:
                return null;
        }
    }

    private void tickLerp() {
        if (this.isControlledByLocalInstance()) {
            this.lerpSteps = 0;
            this.syncPacketPositionCodec(this.getX(), this.getY(), this.getZ());
        }

        if (this.lerpSteps > 0) {
            this.lerpPositionAndRotationStep(this.lerpSteps, this.lerpX, this.lerpY, this.lerpZ, this.lerpYRot, this.lerpXRot);
            --this.lerpSteps;
        }
    }

    public void setPaddleState(boolean param0, boolean param1) {
        this.entityData.set(DATA_ID_PADDLE_LEFT, param0);
        this.entityData.set(DATA_ID_PADDLE_RIGHT, param1);
    }

    public float getRowingTime(int param0, float param1) {
        return this.getPaddleState(param0) ? Mth.clampedLerp(this.paddlePositions[param0] - (float) (Math.PI / 8), this.paddlePositions[param0], param1) : 0.0F;
    }

    private Boat.Status getStatus() {
        Boat.Status var0 = this.isUnderwater();
        if (var0 != null) {
            this.waterLevel = this.getBoundingBox().maxY;
            return var0;
        } else if (this.checkInWater()) {
            return Boat.Status.IN_WATER;
        } else {
            float var1 = this.getGroundFriction();
            if (var1 > 0.0F) {
                this.landFriction = var1;
                return Boat.Status.ON_LAND;
            } else {
                return Boat.Status.IN_AIR;
            }
        }
    }

    public float getWaterLevelAbove() {
        AABB var0 = this.getBoundingBox();
        int var1 = Mth.floor(var0.minX);
        int var2 = Mth.ceil(var0.maxX);
        int var3 = Mth.floor(var0.maxY);
        int var4 = Mth.ceil(var0.maxY - this.lastYd);
        int var5 = Mth.floor(var0.minZ);
        int var6 = Mth.ceil(var0.maxZ);
        BlockPos.MutableBlockPos var7 = new BlockPos.MutableBlockPos();

        label39:
        for(int var8 = var3; var8 < var4; ++var8) {
            float var9 = 0.0F;

            for(int var10 = var1; var10 < var2; ++var10) {
                for(int var11 = var5; var11 < var6; ++var11) {
                    var7.set(var10, var8, var11);
                    FluidState var12 = this.level().getFluidState(var7);
                    if (var12.is(FluidTags.WATER)) {
                        var9 = Math.max(var9, var12.getHeight(this.level(), var7));
                    }

                    if (var9 >= 1.0F) {
                        continue label39;
                    }
                }
            }

            if (var9 < 1.0F) {
                return (float)var7.getY() + var9;
            }
        }

        return (float)(var4 + 1);
    }

    public float getGroundFriction() {
        AABB var0 = this.getBoundingBox();
        AABB var1 = new AABB(var0.minX, var0.minY - 0.001, var0.minZ, var0.maxX, var0.minY, var0.maxZ);
        int var2 = Mth.floor(var1.minX) - 1;
        int var3 = Mth.ceil(var1.maxX) + 1;
        int var4 = Mth.floor(var1.minY) - 1;
        int var5 = Mth.ceil(var1.maxY) + 1;
        int var6 = Mth.floor(var1.minZ) - 1;
        int var7 = Mth.ceil(var1.maxZ) + 1;
        VoxelShape var8 = Shapes.create(var1);
        float var9 = 0.0F;
        int var10 = 0;
        BlockPos.MutableBlockPos var11 = new BlockPos.MutableBlockPos();

        for(int var12 = var2; var12 < var3; ++var12) {
            for(int var13 = var6; var13 < var7; ++var13) {
                int var14 = (var12 != var2 && var12 != var3 - 1 ? 0 : 1) + (var13 != var6 && var13 != var7 - 1 ? 0 : 1);
                if (var14 != 2) {
                    for(int var15 = var4; var15 < var5; ++var15) {
                        if (var14 <= 0 || var15 != var4 && var15 != var5 - 1) {
                            var11.set(var12, var15, var13);
                            BlockState var16 = this.level().getBlockState(var11);
                            if (!(var16.getBlock() instanceof WaterlilyBlock)
                                && Shapes.joinIsNotEmpty(
                                    var16.getCollisionShape(this.level(), var11).move((double)var12, (double)var15, (double)var13), var8, BooleanOp.AND
                                )) {
                                var9 += var16.getBlock().getFriction();
                                ++var10;
                            }
                        }
                    }
                }
            }
        }

        return var9 / (float)var10;
    }

    private boolean checkInWater() {
        AABB var0 = this.getBoundingBox();
        int var1 = Mth.floor(var0.minX);
        int var2 = Mth.ceil(var0.maxX);
        int var3 = Mth.floor(var0.minY);
        int var4 = Mth.ceil(var0.minY + 0.001);
        int var5 = Mth.floor(var0.minZ);
        int var6 = Mth.ceil(var0.maxZ);
        boolean var7 = false;
        this.waterLevel = -Double.MAX_VALUE;
        BlockPos.MutableBlockPos var8 = new BlockPos.MutableBlockPos();

        for(int var9 = var1; var9 < var2; ++var9) {
            for(int var10 = var3; var10 < var4; ++var10) {
                for(int var11 = var5; var11 < var6; ++var11) {
                    var8.set(var9, var10, var11);
                    FluidState var12 = this.level().getFluidState(var8);
                    if (var12.is(FluidTags.WATER)) {
                        float var13 = (float)var10 + var12.getHeight(this.level(), var8);
                        this.waterLevel = Math.max((double)var13, this.waterLevel);
                        var7 |= var0.minY < (double)var13;
                    }
                }
            }
        }

        return var7;
    }

    @Nullable
    private Boat.Status isUnderwater() {
        AABB var0 = this.getBoundingBox();
        double var1 = var0.maxY + 0.001;
        int var2 = Mth.floor(var0.minX);
        int var3 = Mth.ceil(var0.maxX);
        int var4 = Mth.floor(var0.maxY);
        int var5 = Mth.ceil(var1);
        int var6 = Mth.floor(var0.minZ);
        int var7 = Mth.ceil(var0.maxZ);
        boolean var8 = false;
        BlockPos.MutableBlockPos var9 = new BlockPos.MutableBlockPos();

        for(int var10 = var2; var10 < var3; ++var10) {
            for(int var11 = var4; var11 < var5; ++var11) {
                for(int var12 = var6; var12 < var7; ++var12) {
                    var9.set(var10, var11, var12);
                    FluidState var13 = this.level().getFluidState(var9);
                    if (var13.is(FluidTags.WATER) && var1 < (double)((float)var9.getY() + var13.getHeight(this.level(), var9))) {
                        if (!var13.isSource()) {
                            return Boat.Status.UNDER_FLOWING_WATER;
                        }

                        var8 = true;
                    }
                }
            }
        }

        return var8 ? Boat.Status.UNDER_WATER : null;
    }

    private void floatBoat() {
        double var0 = -0.04F;
        double var1 = this.isNoGravity() ? 0.0 : -0.04F;
        double var2 = 0.0;
        this.invFriction = 0.05F;
        if (this.oldStatus == Boat.Status.IN_AIR && this.status != Boat.Status.IN_AIR && this.status != Boat.Status.ON_LAND) {
            this.waterLevel = this.getY(1.0);
            this.setPos(this.getX(), (double)(this.getWaterLevelAbove() - this.getBbHeight()) + 0.101, this.getZ());
            this.setDeltaMovement(this.getDeltaMovement().multiply(1.0, 0.0, 1.0));
            this.lastYd = 0.0;
            this.status = Boat.Status.IN_WATER;
        } else {
            if (this.status == Boat.Status.IN_WATER) {
                var2 = (this.waterLevel - this.getY()) / (double)this.getBbHeight();
                this.invFriction = 0.9F;
            } else if (this.status == Boat.Status.UNDER_FLOWING_WATER) {
                var1 = -7.0E-4;
                this.invFriction = 0.9F;
            } else if (this.status == Boat.Status.UNDER_WATER) {
                var2 = 0.01F;
                this.invFriction = 0.45F;
            } else if (this.status == Boat.Status.IN_AIR) {
                this.invFriction = 0.9F;
            } else if (this.status == Boat.Status.ON_LAND) {
                this.invFriction = this.landFriction;
                if (this.getControllingPassenger() instanceof Player) {
                    this.landFriction /= 2.0F;
                }
            }

            Vec3 var3 = this.getDeltaMovement();
            this.setDeltaMovement(var3.x * (double)this.invFriction, var3.y + var1, var3.z * (double)this.invFriction);
            this.deltaRotation *= this.invFriction;
            if (var2 > 0.0) {
                Vec3 var4 = this.getDeltaMovement();
                this.setDeltaMovement(var4.x, (var4.y + var2 * 0.06153846016296973) * 0.75, var4.z);
            }
        }

    }

    private void controlBoat() {
        if (this.isVehicle()) {
            float var0 = 0.0F;
            if (this.inputLeft) {
                --this.deltaRotation;
            }

            if (this.inputRight) {
                ++this.deltaRotation;
            }

            if (this.inputRight != this.inputLeft && !this.inputUp && !this.inputDown) {
                var0 += 0.005F;
            }

            this.setYRot(this.getYRot() + this.deltaRotation);
            if (this.inputUp) {
                var0 += 0.04F;
            }

            if (this.inputDown) {
                var0 -= 0.005F;
            }

            this.setDeltaMovement(
                this.getDeltaMovement()
                    .add(
                        (double)(Mth.sin(-this.getYRot() * (float) (Math.PI / 180.0)) * var0),
                        0.0,
                        (double)(Mth.cos(this.getYRot() * (float) (Math.PI / 180.0)) * var0)
                    )
            );
            this.setPaddleState(this.inputRight && !this.inputLeft || this.inputUp, this.inputLeft && !this.inputRight || this.inputUp);
        }
    }

    protected float getSinglePassengerXOffset() {
        return 0.0F;
    }

    public boolean hasEnoughSpaceFor(Entity param0) {
        return param0.getBbWidth() < this.getBbWidth();
    }

    @Override
    protected void positionRider(Entity param0, Entity.MoveFunction param1) {
        super.positionRider(param0, param1);
        if (!param0.getType().is(EntityTypeTags.CAN_TURN_IN_BOATS)) {
            param0.setYRot(param0.getYRot() + this.deltaRotation);
            param0.setYHeadRot(param0.getYHeadRot() + this.deltaRotation);
            this.clampRotation(param0);
            if (param0 instanceof Animal && this.getPassengers().size() == this.getMaxPassengers()) {
                int var0 = param0.getId() % 2 == 0 ? 90 : 270;
                param0.setYBodyRot(((Animal)param0).yBodyRot + (float)var0);
                param0.setYHeadRot(param0.getYHeadRot() + (float)var0);
            }

        }
    }

    @Override
    public Vec3 getDismountLocationForPassenger(LivingEntity param0) {
        Vec3 var0 = getCollisionHorizontalEscapeVector((double)(this.getBbWidth() * Mth.SQRT_OF_TWO), (double)param0.getBbWidth(), param0.getYRot());
        double var1 = this.getX() + var0.x;
        double var2 = this.getZ() + var0.z;
        BlockPos var3 = BlockPos.containing(var1, this.getBoundingBox().maxY, var2);
        BlockPos var4 = var3.below();
        if (!this.level().isWaterAt(var4)) {
            List<Vec3> var5 = Lists.newArrayList();
            double var6 = this.level().getBlockFloorHeight(var3);
            if (DismountHelper.isBlockFloorValid(var6)) {
                var5.add(new Vec3(var1, (double)var3.getY() + var6, var2));
            }

            double var7 = this.level().getBlockFloorHeight(var4);
            if (DismountHelper.isBlockFloorValid(var7)) {
                var5.add(new Vec3(var1, (double)var4.getY() + var7, var2));
            }

            for(Pose var8 : param0.getDismountPoses()) {
                for(Vec3 var9 : var5) {
                    if (DismountHelper.canDismountTo(this.level(), var9, param0, var8)) {
                        param0.setPose(var8);
                        return var9;
                    }
                }
            }
        }

        return super.getDismountLocationForPassenger(param0);
    }

    protected void clampRotation(Entity param0) {
        param0.setYBodyRot(this.getYRot());
        float var0 = Mth.wrapDegrees(param0.getYRot() - this.getYRot());
        float var1 = Mth.clamp(var0, -105.0F, 105.0F);
        param0.yRotO += var1 - var0;
        param0.setYRot(param0.getYRot() + var1 - var0);
        param0.setYHeadRot(param0.getYRot());
    }

    @Override
    public void onPassengerTurned(Entity param0) {
        this.clampRotation(param0);
    }

    @Override
    protected void addAdditionalSaveData(CompoundTag param0) {
        param0.putString("Type", this.getVariant().getSerializedName());
    }

    @Override
    protected void readAdditionalSaveData(CompoundTag param0) {
        if (param0.contains("Type", 8)) {
            this.setVariant(Boat.Type.byName(param0.getString("Type")));
        }

    }

    @Override
    public InteractionResult interact(Player param0, InteractionHand param1) {
        if (param0.isSecondaryUseActive()) {
            return InteractionResult.PASS;
        } else if (this.outOfControlTicks < 60.0F) {
            if (!this.level().isClientSide) {
                return param0.startRiding(this) ? InteractionResult.CONSUME : InteractionResult.PASS;
            } else {
                return InteractionResult.SUCCESS;
            }
        } else {
            return InteractionResult.PASS;
        }
    }

    @Override
    protected void checkFallDamage(double param0, boolean param1, BlockState param2, BlockPos param3) {
        this.lastYd = this.getDeltaMovement().y;
        if (!this.isPassenger()) {
            if (param1) {
                if (this.fallDistance > 3.0F) {
                    if (this.status != Boat.Status.ON_LAND) {
                        this.resetFallDistance();
                        return;
                    }

                    this.causeFallDamage(this.fallDistance, 1.0F, this.damageSources().fall());
                    if (!this.level().isClientSide && !this.isRemoved()) {
                        this.kill();
                        if (this.level().getGameRules().getBoolean(GameRules.RULE_DOENTITYDROPS)) {
                            for(int var0 = 0; var0 < 3; ++var0) {
                                this.spawnAtLocation(this.getVariant().getPlanks());
                            }

                            for(int var1 = 0; var1 < 2; ++var1) {
                                this.spawnAtLocation(Items.STICK);
                            }
                        }
                    }
                }

                this.resetFallDistance();
            } else if (!this.level().getFluidState(this.blockPosition().below()).is(FluidTags.WATER) && param0 < 0.0) {
                this.fallDistance -= (float)param0;
            }

        }
    }

    public boolean getPaddleState(int param0) {
        return this.entityData.<Boolean>get(param0 == 0 ? DATA_ID_PADDLE_LEFT : DATA_ID_PADDLE_RIGHT) && this.getControllingPassenger() != null;
    }

    private void setBubbleTime(int param0) {
        this.entityData.set(DATA_ID_BUBBLE_TIME, param0);
    }

    private int getBubbleTime() {
        return this.entityData.get(DATA_ID_BUBBLE_TIME);
    }

    public float getBubbleAngle(float param0) {
        return Mth.lerp(param0, this.bubbleAngleO, this.bubbleAngle);
    }

    public void setVariant(Boat.Type param0) {
        this.entityData.set(DATA_ID_TYPE, param0.ordinal());
    }

    public Boat.Type getVariant() {
        return Boat.Type.byId(this.entityData.get(DATA_ID_TYPE));
    }

    @Override
    protected boolean canAddPassenger(Entity param0) {
        return this.getPassengers().size() < this.getMaxPassengers() && !this.isEyeInFluid(FluidTags.WATER);
    }

    protected int getMaxPassengers() {
        return 2;
    }

    @Nullable
    @Override
    public LivingEntity getControllingPassenger() {
        Entity var2 = this.getFirstPassenger();
        return var2 instanceof LivingEntity var0 ? var0 : super.getControllingPassenger();
    }

    public void setInput(boolean param0, boolean param1, boolean param2, boolean param3) {
        this.inputLeft = param0;
        this.inputRight = param1;
        this.inputUp = param2;
        this.inputDown = param3;
    }

    @Override
    protected Component getTypeName() {
        return Component.translatable(this.getDropItem().getDescriptionId());
    }

    @Override
    public boolean isUnderWater() {
        return this.status == Boat.Status.UNDER_WATER || this.status == Boat.Status.UNDER_FLOWING_WATER;
    }

    @Override
    public ItemStack getPickResult() {
        return new ItemStack(this.getDropItem());
    }

    public static enum Status {
        IN_WATER,
        UNDER_WATER,
        UNDER_FLOWING_WATER,
        ON_LAND,
        IN_AIR;
    }

    public static enum Type implements StringRepresentable {
        OAK(Blocks.OAK_PLANKS, "oak"),
        SPRUCE(Blocks.SPRUCE_PLANKS, "spruce"),
        BIRCH(Blocks.BIRCH_PLANKS, "birch"),
        JUNGLE(Blocks.JUNGLE_PLANKS, "jungle"),
        ACACIA(Blocks.ACACIA_PLANKS, "acacia"),
        CHERRY(Blocks.CHERRY_PLANKS, "cherry"),
        DARK_OAK(Blocks.DARK_OAK_PLANKS, "dark_oak"),
        MANGROVE(Blocks.MANGROVE_PLANKS, "mangrove"),
        BAMBOO(Blocks.BAMBOO_PLANKS, "bamboo");

        private final String name;
        private final Block planks;
        public static final StringRepresentable.EnumCodec<Boat.Type> CODEC = StringRepresentable.fromEnum(Boat.Type::values);
        private static final IntFunction<Boat.Type> BY_ID = ByIdMap.continuous(Enum::ordinal, values(), ByIdMap.OutOfBoundsStrategy.ZERO);

        private Type(Block param0, String param1) {
            this.name = param1;
            this.planks = param0;
        }

        @Override
        public String getSerializedName() {
            return this.name;
        }

        public String getName() {
            return this.name;
        }

        public Block getPlanks() {
            return this.planks;
        }

        @Override
        public String toString() {
            return this.name;
        }

        public static Boat.Type byId(int param0) {
            return BY_ID.apply(param0);
        }

        public static Boat.Type byName(String param0) {
            return CODEC.byName(param0, OAK);
        }
    }
}
