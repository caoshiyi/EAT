package net.minecraft.world.entity.projectile;

import net.minecraft.core.BlockPos;
import net.minecraft.core.particles.ParticleTypes;
import net.minecraft.world.entity.EntityType;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.entity.BlockEntity;
import net.minecraft.world.level.block.entity.TheEndGatewayBlockEntity;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraft.world.phys.Vec3;

public abstract class ThrowableProjectile extends Projectile {
    protected ThrowableProjectile(EntityType<? extends ThrowableProjectile> param0, Level param1) {
        super(param0, param1);
    }

    protected ThrowableProjectile(EntityType<? extends ThrowableProjectile> param0, double param1, double param2, double param3, Level param4) {
        this(param0, param4);
        this.setPos(param1, param2, param3);
    }

    protected ThrowableProjectile(EntityType<? extends ThrowableProjectile> param0, LivingEntity param1, Level param2) {
        this(param0, param1.getX(), param1.getEyeY() - 0.1F, param1.getZ(), param2);
        this.setOwner(param1);
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

    @Override
    public void tick() {
        super.tick();
        HitResult var0 = ProjectileUtil.getHitResultOnMoveVector(this, this::canHitEntity);
        boolean var1 = false;
        if (var0.getType() == HitResult.Type.BLOCK) {
            BlockPos var2 = ((BlockHitResult)var0).getBlockPos();
            BlockState var3 = this.level().getBlockState(var2);
            if (var3.is(Blocks.NETHER_PORTAL)) {
                this.handleInsidePortal(var2);
                var1 = true;
            } else if (var3.is(Blocks.END_GATEWAY)) {
                BlockEntity var4 = this.level().getBlockEntity(var2);
                if (var4 instanceof TheEndGatewayBlockEntity && TheEndGatewayBlockEntity.canEntityTeleport(this)) {
                    TheEndGatewayBlockEntity.teleportEntity(this.level(), var2, var3, this, (TheEndGatewayBlockEntity)var4);
                }

                var1 = true;
            }
        }

        if (var0.getType() != HitResult.Type.MISS && !var1) {
            this.onHit(var0);
        }

        this.checkInsideBlocks();
        Vec3 var5 = this.getDeltaMovement();
        double var6 = this.getX() + var5.x;
        double var7 = this.getY() + var5.y;
        double var8 = this.getZ() + var5.z;
        this.updateRotation();
        float var11;
        if (this.isInWater()) {
            for(int var9 = 0; var9 < 4; ++var9) {
                float var10 = 0.25F;
                this.level().addParticle(ParticleTypes.BUBBLE, var6 - var5.x * 0.25, var7 - var5.y * 0.25, var8 - var5.z * 0.25, var5.x, var5.y, var5.z);
            }

            var11 = 0.8F;
        } else {
            var11 = 0.99F;
        }

        this.setDeltaMovement(var5.scale((double)var11));
        if (!this.isNoGravity()) {
            Vec3 var13 = this.getDeltaMovement();
            this.setDeltaMovement(var13.x, var13.y - (double)this.getGravity(), var13.z);
        }

        this.setPos(var6, var7, var8);
    }

    protected float getGravity() {
        return 0.03F;
    }
}
