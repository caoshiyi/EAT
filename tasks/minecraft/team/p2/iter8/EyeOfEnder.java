package net.minecraft.world.entity.projectile;

import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.network.syncher.EntityDataAccessor;
import net.minecraft.network.syncher.EntityDataSerializers;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.item.ItemEntity;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.level.Level;
import net.minecraft.world.phys.Vec3;

public class EyeOfEnder extends Entity implements ItemSupplier {
    private static final EntityDataAccessor<ItemStack> DATA_ITEM_STACK = SynchedEntityData.defineId(EyeOfEnder.class, EntityDataSerializers.ITEM_STACK);
    private double tx;
    private double ty;
    private double tz;
    private int life;
    private boolean surviveAfterDeath;

    public EyeOfEnder(EntityType<? extends EyeOfEnder> param0, Level param1) {
        super(param0, param1);
    }

    public EyeOfEnder(Level param0, double param1, double param2, double param3) {
        this(EntityType.EYE_OF_ENDER, param0);
        this.setPos(param1, param2, param3);
    }

    public void setItem(ItemStack param0) {
        if (!param0.is(Items.ENDER_EYE) || param0.hasTag()) {
            this.getEntityData().set(DATA_ITEM_STACK, param0.copyWithCount(1));
        }

    }

    private ItemStack getItemRaw() {
        return this.getEntityData().get(DATA_ITEM_STACK);
    }

    @Override
    public ItemStack getItem() {
        ItemStack var0 = this.getItemRaw();
        return var0.isEmpty() ? new ItemStack(Items.ENDER_EYE) : var0;
    }

    @Override
    protected void defineSynchedData() {
        this.getEntityData().define(DATA_ITEM_STACK, ItemStack.EMPTY);
    }

    @Override
    public boolean shouldRenderAtSqrDistance(double param0) {
        double var0 = this.getBoundingBox().getSize() * 4.0;
        if (Double.isNaN(var0)) {
            var0 = 4.0;
        }

        var0 *= 64.0;
        return param0 < var0 * var0;
    }

    public void signalTo(BlockPos param0) {
        double var0 = (double)param0.getX();
        int var1 = param0.getY();
        double var2 = (double)param0.getZ();
        double var3 = var0 - this.getX();
        double var4 = var2 - this.getZ();
        double var5 = Math.sqrt(var3 * var3 + var4 * var4);
        if (var5 > 12.0) {
            this.tx = this.getX() + var3 / var5 * 12.0;
            this.tz = this.getZ() + var4 / var5 * 12.0;
            this.ty = this.getY() + 8.0;
        } else {
            this.tx = var0;
            this.ty = (double)var1;
            this.tz = var2;
        }

        this.life = 0;
        this.surviveAfterDeath = this.random.nextInt(5) > 0;
    }

    @Override
    public void lerpMotion(double param0, double param1, double param2) {
        this.setDeltaMovement(param0, param1, param2);
        if (this.xRotO == 0.0F && this.yRotO == 0.0F) {
            double var0 = Math.sqrt(param0 * param0 + param2 * param2);
            this.setYRot((float)(Mth.atan2(param0, param2) * 180.0F / (float)Math.PI));
            this.setXRot((float)(Mth.atan2(param1, var0) * 180.0F / (float)Math.PI));
            this.yRotO = this.getYRot();
            this.xRotO = this.getXRot();
        }

    }

    @Override
    public void tick() {
        super.tick();
        Vec3 var0 = this.getDeltaMovement();
        double var1 = this.getX() + var0.x;
        double var2 = this.getY() + var0.y;
        double var3 = this.getZ() + var0.z;
        double var4 = var0.horizontalDistance();
        this.setXRot(Projectile.lerpRotation(this.xRotO, (float)(Mth.atan2(var0.y, var4) * 180.0F / (float)Math.PI)));
        this.setYRot(Projectile.lerpRotation(this.yRotO, (float)(Mth.atan2(var0.x, var0.z) * 180.0F / (float)Math.PI)));
        if (!this.level().isClientSide) {
            double var5 = this.tx - var1;
            double var6 = this.tz - var3;
            float var7 = (float)Math.sqrt(var5 * var5 + var6 * var6);
            float var8 = (float)Mth.atan2(var6, var5);
            double var9 = Mth.lerp(0.0025, var4, (double)var7);
            double var10 = var0.y;
            if (var7 < 1.0F) {
                var9 *= 0.8;
                var10 *= 0.8;
            }

            int var11 = this.getY() < this.ty ? 1 : -1;
            var0 = new Vec3(Math.cos((double)var8) * var9, var10 + ((double)var11 - var10) * 0.015F, Math.sin((double)var8) * var9);
            this.setDeltaMovement(var0);
        }

        float var12 = 0.25F;
        if (this.isInWater()) {
            for(int var13 = 0; var13 < 4; ++var13) {
                this.level().addParticle(ParticleTypes.BUBBLE, var1 - var0.x * 0.25, var2 - var0.y * 0.25, var3 - var0.z * 0.25, var0.x, var0.y, var0.z);
            }
        } else {
            this.level()
                .addParticle(
                    ParticleTypes.PORTAL,
                    var1 - var0.x * 0.25 + this.random.nextDouble() * 0.6 - 0.3,
                    var2 - var0.y * 0.25 - 0.5,
                    var3 - var0.z * 0.25 + this.random.nextDouble() * 0.6 - 0.3,
                    var0.x,
                    var0.y,
                    var0.z
                );
        }

        if (!this.level().isClientSide) {
            this.setPos(var1, var2, var3);
            ++this.life;
            if (this.life > 80 && !this.level().isClientSide) {
                this.playSound(SoundEvents.ENDER_EYE_DEATH, 1.0F, 1.0F);
                this.discard();
                if (this.surviveAfterDeath) {
                    this.level().addFreshEntity(new ItemEntity(this.level(), this.getX(), this.getY(), this.getZ(), this.getItem()));
                } else {
                    this.level().levelEvent(2003, this.blockPosition(), 0);
                }
            }
        } else {
            this.setPosRaw(var1, var2, var3);
        }

    }

    @Override
    public void addAdditionalSaveData(CompoundTag param0) {
        ItemStack var0 = this.getItemRaw();
        if (!var0.isEmpty()) {
            param0.put("Item", var0.save(new CompoundTag()));
        }

    }

    @Override
    public void readAdditionalSaveData(CompoundTag param0) {
        ItemStack var0 = ItemStack.of(param0.getCompound("Item"));
        this.setItem(var0);
    }

    @Override
    public float getLightLevelDependentMagicValue() {
        return 1.0F;
    }

    @Override
    public boolean isAttackable() {
        return false;
    }
}
