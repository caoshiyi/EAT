package net.minecraft.server.level;

import com.google.common.collect.Lists;
import com.mojang.datafixers.util.Pair;
import com.mojang.logging.LogUtils;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Stream;
import javax.annotation.Nullable;
import net.minecraft.network.protocol.Packet;
import net.minecraft.network.protocol.game.ClientGamePacketListener;
import net.minecraft.network.protocol.game.ClientboundBundlePacket;
import net.minecraft.network.protocol.game.ClientboundMoveEntityPacket;
import net.minecraft.network.protocol.game.ClientboundRemoveEntitiesPacket;
import net.minecraft.network.protocol.game.ClientboundRotateHeadPacket;
import net.minecraft.network.protocol.game.ClientboundSetEntityDataPacket;
import net.minecraft.network.protocol.game.ClientboundSetEntityLinkPacket;
import net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket;
import net.minecraft.network.protocol.game.ClientboundSetEquipmentPacket;
import net.minecraft.network.protocol.game.ClientboundSetPassengersPacket;
import net.minecraft.network.protocol.game.ClientboundTeleportEntityPacket;
import net.minecraft.network.protocol.game.ClientboundUpdateAttributesPacket;
import net.minecraft.network.protocol.game.VecDeltaCodec;
import net.minecraft.network.syncher.SynchedEntityData;
import net.minecraft.util.Mth;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.ai.attributes.AttributeInstance;
import net.minecraft.world.entity.decoration.ItemFrame;
import net.minecraft.world.entity.projectile.AbstractArrow;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.MapItem;
import net.minecraft.world.level.saveddata.maps.MapItemSavedData;
import net.minecraft.world.phys.Vec3;
import org.slf4j.Logger;

public class ServerEntity {
    private static final Logger LOGGER = LogUtils.getLogger();
    private static final int TOLERANCE_LEVEL_ROTATION = 1;
    private static final double TOLERANCE_LEVEL_POSITION = 7.6293945E-6F;
    public static final int FORCED_POS_UPDATE_PERIOD = 60;
    private static final int FORCED_TELEPORT_PERIOD = 400;
    private final ServerLevel level;
    private final Entity entity;
    private final int updateInterval;
    private final boolean trackDelta;
    private final Consumer<Packet<?>> broadcast;
    private final VecDeltaCodec positionCodec = new VecDeltaCodec();
    private int yRotp;
    private int xRotp;
    private int yHeadRotp;
    private Vec3 ap = Vec3.ZERO;
    private int tickCount;
    private int teleportDelay;
    private List<Entity> lastPassengers = Collections.emptyList();
    private boolean wasRiding;
    private boolean wasOnGround;
    @Nullable
    private List<SynchedEntityData.DataValue<?>> trackedDataValues;

    public ServerEntity(ServerLevel param0, Entity param1, int param2, boolean param3, Consumer<Packet<?>> param4) {
        this.level = param0;
        this.broadcast = param4;
        this.entity = param1;
        this.updateInterval = param2;
        this.trackDelta = param3;
        this.positionCodec.setBase(param1.trackingPosition());
        this.yRotp = Mth.floor(param1.getYRot() * 256.0F / 360.0F);
        this.xRotp = Mth.floor(param1.getXRot() * 256.0F / 360.0F);
        this.yHeadRotp = Mth.floor(param1.getYHeadRot() * 256.0F / 360.0F);
        this.wasOnGround = param1.onGround();
        this.trackedDataValues = param1.getEntityData().getNonDefaultValues();
    }

    public void sendChanges() {
        List<Entity> var0 = this.entity.getPassengers();
        if (!var0.equals(this.lastPassengers)) {
            this.broadcast.accept(new ClientboundSetPassengersPacket(this.entity));
            removedPassengers(var0, this.lastPassengers).forEach(param0 -> {
                if (param0 instanceof ServerPlayer var0x) {
                    var0x.connection.teleport(var0x.getX(), var0x.getY(), var0x.getZ(), var0x.getYRot(), var0x.getXRot());
                }

            });
            this.lastPassengers = var0;
        }

        Entity var11 = this.entity;
        if (var11 instanceof ItemFrame var1 && this.tickCount % 10 == 0) {
            ItemStack var2 = var1.getItem();
            if (var2.getItem() instanceof MapItem) {
                Integer var3x = MapItem.getMapId(var2);
                MapItemSavedData var4 = MapItem.getSavedData(var3x, this.level);
                if (var4 != null) {
                    for(ServerPlayer var5 : this.level.players()) {
                        var4.tickCarriedBy(var5, var2);
                        Packet<?> var6 = var4.getUpdatePacket(var3x, var5);
                        if (var6 != null) {
                            var5.connection.send(var6);
                        }
                    }
                }
            }

            this.sendDirtyEntityData();
        }

        if (this.tickCount % this.updateInterval == 0 || this.entity.hasImpulse || this.entity.getEntityData().isDirty()) {
            if (this.entity.isPassenger()) {
                int var7 = Mth.floor(this.entity.getYRot() * 256.0F / 360.0F);
                int var8 = Mth.floor(this.entity.getXRot() * 256.0F / 360.0F);
                boolean var9 = Math.abs(var7 - this.yRotp) >= 1 || Math.abs(var8 - this.xRotp) >= 1;
                if (var9) {
                    this.broadcast.accept(new ClientboundMoveEntityPacket.Rot(this.entity.getId(), (byte)var7, (byte)var8, this.entity.onGround()));
                    this.yRotp = var7;
                    this.xRotp = var8;
                }

                this.positionCodec.setBase(this.entity.trackingPosition());
                this.sendDirtyEntityData();
                this.wasRiding = true;
            } else {
                ++this.teleportDelay;
                int var10 = Mth.floor(this.entity.getYRot() * 256.0F / 360.0F);
                int var11 = Mth.floor(this.entity.getXRot() * 256.0F / 360.0F);
                Vec3 var12 = this.entity.trackingPosition();
                boolean var13 = this.positionCodec.delta(var12).lengthSqr() >= 7.6293945E-6F;
                Packet<?> var14 = null;
                boolean var15 = var13 || this.tickCount % 60 == 0;
                boolean var16 = Math.abs(var10 - this.yRotp) >= 1 || Math.abs(var11 - this.xRotp) >= 1;
                boolean var17 = false;
                boolean var18 = false;
                if (this.tickCount > 0 || this.entity instanceof AbstractArrow) {
                    long var19 = this.positionCodec.encodeX(var12);
                    long var20 = this.positionCodec.encodeY(var12);
                    long var21 = this.positionCodec.encodeZ(var12);
                    boolean var22 = var19 < -32768L || var19 > 32767L || var20 < -32768L || var20 > 32767L || var21 < -32768L || var21 > 32767L;
                    if (var22 || this.teleportDelay > 400 || this.wasRiding || this.wasOnGround != this.entity.onGround()) {
                        this.wasOnGround = this.entity.onGround();
                        this.teleportDelay = 0;
                        var14 = new ClientboundTeleportEntityPacket(this.entity);
                        var17 = true;
                        var18 = true;
                    } else if ((!var15 || !var16) && !(this.entity instanceof AbstractArrow)) {
                        if (var15) {
                            var14 = new ClientboundMoveEntityPacket.Pos(
                                this.entity.getId(), (short)((int)var19), (short)((int)var20), (short)((int)var21), this.entity.onGround()
                            );
                            var17 = true;
                        } else if (var16) {
                            var14 = new ClientboundMoveEntityPacket.Rot(this.entity.getId(), (byte)var10, (byte)var11, this.entity.onGround());
                            var18 = true;
                        }
                    } else {
                        var14 = new ClientboundMoveEntityPacket.PosRot(
                            this.entity.getId(),
                            (short)((int)var19),
                            (short)((int)var20),
                            (short)((int)var21),
                            (byte)var10,
                            (byte)var11,
                            this.entity.onGround()
                        );
                        var17 = true;
                        var18 = true;
                    }
                }

                if ((this.trackDelta || this.entity.hasImpulse || this.entity instanceof LivingEntity && ((LivingEntity)this.entity).isFallFlying())
                    && this.tickCount > 0) {
                    Vec3 var23 = this.entity.getDeltaMovement();
                    double var24 = var23.distanceToSqr(this.ap);
                    if (var24 > 1.0E-7 || var24 > 0.0 && var23.lengthSqr() == 0.0) {
                        this.ap = var23;
                        this.broadcast.accept(new ClientboundSetEntityMotionPacket(this.entity.getId(), this.ap));
                    }
                }

                if (var14 != null) {
                    this.broadcast.accept(var14);
                }

                this.sendDirtyEntityData();
                if (var17) {
                    this.positionCodec.setBase(var12);
                }

                if (var18) {
                    this.yRotp = var10;
                    this.xRotp = var11;
                }

                this.wasRiding = false;
            }

            int var25 = Mth.floor(this.entity.getYHeadRot() * 256.0F / 360.0F);
            if (Math.abs(var25 - this.yHeadRotp) >= 1) {
                this.broadcast.accept(new ClientboundRotateHeadPacket(this.entity, (byte)var25));
                this.yHeadRotp = var25;
            }

            this.entity.hasImpulse = false;
        }

        ++this.tickCount;
        if (this.entity.hurtMarked) {
            this.broadcastAndSend(new ClientboundSetEntityMotionPacket(this.entity));
            this.entity.hurtMarked = false;
        }

    }

    private static Stream<Entity> removedPassengers(List<Entity> param0, List<Entity> param1) {
        return param1.stream().filter(param1x -> !param0.contains(param1x));
    }

    public void removePairing(ServerPlayer param0) {
        this.entity.stopSeenByPlayer(param0);
        param0.connection.send(new ClientboundRemoveEntitiesPacket(this.entity.getId()));
    }

    public void addPairing(ServerPlayer param0) {
        List<Packet<ClientGamePacketListener>> var0 = new ArrayList<>();
        this.sendPairingData(param0, var0::add);
        param0.connection.send(new ClientboundBundlePacket(var0));
        this.entity.startSeenByPlayer(param0);
    }

    public void sendPairingData(ServerPlayer param0, Consumer<Packet<ClientGamePacketListener>> param1) {
        if (this.entity.isRemoved()) {
            LOGGER.warn("Fetching packet for removed entity {}", this.entity);
        }

        Packet<ClientGamePacketListener> var0 = this.entity.getAddEntityPacket();
        this.yHeadRotp = Mth.floor(this.entity.getYHeadRot() * 256.0F / 360.0F);
        param1.accept(var0);
        if (this.trackedDataValues != null) {
            param1.accept(new ClientboundSetEntityDataPacket(this.entity.getId(), this.trackedDataValues));
        }

        boolean var1 = this.trackDelta;
        if (this.entity instanceof LivingEntity) {
            Collection<AttributeInstance> var2 = ((LivingEntity)this.entity).getAttributes().getSyncableAttributes();
            if (!var2.isEmpty()) {
                param1.accept(new ClientboundUpdateAttributesPacket(this.entity.getId(), var2));
            }

            if (((LivingEntity)this.entity).isFallFlying()) {
                var1 = true;
            }
        }

        this.ap = this.entity.getDeltaMovement();
        if (var1 && !(this.entity instanceof LivingEntity)) {
            param1.accept(new ClientboundSetEntityMotionPacket(this.entity.getId(), this.ap));
        }

        if (this.entity instanceof LivingEntity) {
            List<Pair<EquipmentSlot, ItemStack>> var3 = Lists.newArrayList();

            for(EquipmentSlot var4 : EquipmentSlot.values()) {
                ItemStack var5 = ((LivingEntity)this.entity).getItemBySlot(var4);
                if (!var5.isEmpty()) {
                    var3.add(Pair.of(var4, var5.copy()));
                }
            }

            if (!var3.isEmpty()) {
                param1.accept(new ClientboundSetEquipmentPacket(this.entity.getId(), var3));
            }
        }

        if (!this.entity.getPassengers().isEmpty()) {
            param1.accept(new ClientboundSetPassengersPacket(this.entity));
        }

        if (this.entity.isPassenger()) {
            param1.accept(new ClientboundSetPassengersPacket(this.entity.getVehicle()));
        }

        Entity var13 = this.entity;
        if (var13 instanceof Mob var6 && var6.isLeashed()) {
            param1.accept(new ClientboundSetEntityLinkPacket(var6, var6.getLeashHolder()));
        }

    }

    private void sendDirtyEntityData() {
        SynchedEntityData var0 = this.entity.getEntityData();
        List<SynchedEntityData.DataValue<?>> var1 = var0.packDirty();
        if (var1 != null) {
            this.trackedDataValues = var0.getNonDefaultValues();
            this.broadcastAndSend(new ClientboundSetEntityDataPacket(this.entity.getId(), var1));
        }

        if (this.entity instanceof LivingEntity) {
            Set<AttributeInstance> var2 = ((LivingEntity)this.entity).getAttributes().getDirtyAttributes();
            if (!var2.isEmpty()) {
                this.broadcastAndSend(new ClientboundUpdateAttributesPacket(this.entity.getId(), var2));
            }

            var2.clear();
        }

    }

    private void broadcastAndSend(Packet<?> param0) {
        this.broadcast.accept(param0);
        if (this.entity instanceof ServerPlayer) {
            ((ServerPlayer)this.entity).connection.send(param0);
        }

    }
}
