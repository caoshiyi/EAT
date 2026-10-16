package net.minecraft.world.item;

import net.minecraft.advancements.CriteriaTriggers;
import net.minecraft.core.BlockPos;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.stats.Stats;
import net.minecraft.tags.StructureTags;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.InteractionResultHolder;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.EyeOfEnder;
import net.minecraft.world.item.context.UseOnContext;
import net.minecraft.world.level.ClipContext;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.EndPortalFrameBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.block.state.pattern.BlockPattern;
import net.minecraft.world.level.gameevent.GameEvent;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.HitResult;

public class EnderEyeItem extends Item {
    public EnderEyeItem(Item.Properties param0) {
        super(param0);
    }

    @Override
    public InteractionResult useOn(UseOnContext param0) {
        Level var0 = param0.getLevel();
        BlockPos var1 = param0.getClickedPos();
        BlockState var2 = var0.getBlockState(var1);
        if (!var2.is(Blocks.END_PORTAL_FRAME) || var2.getValue(EndPortalFrameBlock.HAS_EYE)) {
            return InteractionResult.PASS;
        } else if (var0.isClientSide) {
            return InteractionResult.SUCCESS;
        } else {
            BlockState var3 = var2.setValue(EndPortalFrameBlock.HAS_EYE, Boolean.valueOf(true));
            Block.pushEntitiesUp(var2, var3, var0, var1);
            var0.setBlock(var1, var3, 2);
            var0.updateNeighbourForOutputSignal(var1, Blocks.END_PORTAL_FRAME);
            param0.getItemInHand().shrink(1);
            var0.levelEvent(1503, var1, 0);
            BlockPattern.BlockPatternMatch var4 = EndPortalFrameBlock.getOrCreatePortalShape().find(var0, var1);
            if (var4 != null) {
                BlockPos var5 = var4.getFrontTopLeft().offset(-3, 0, -3);

                for(int var6 = 0; var6 < 3; ++var6) {
                    for(int var7 = 0; var7 < 3; ++var7) {
                        var0.setBlock(var5.offset(var6, 0, var7), Blocks.END_PORTAL.defaultBlockState(), 2);
                    }
                }

                var0.globalLevelEvent(1038, var5.offset(1, 0, 1), 0);
            }

            return InteractionResult.CONSUME;
        }
    }

    @Override
    public InteractionResultHolder<ItemStack> use(Level param0, Player param1, InteractionHand param2) {
        ItemStack var0 = param1.getItemInHand(param2);
        BlockHitResult var1 = getPlayerPOVHitResult(param0, param1, ClipContext.Fluid.NONE);
        if (var1.getType() == HitResult.Type.BLOCK && param0.getBlockState(var1.getBlockPos()).is(Blocks.END_PORTAL_FRAME)) {
            return InteractionResultHolder.pass(var0);
        } else {
            param1.startUsingItem(param2);
            if (param0 instanceof ServerLevel var2) {
                BlockPos var3 = var2.findNearestMapStructure(StructureTags.EYE_OF_ENDER_LOCATED, param1.blockPosition(), 100, false);
                if (var3 != null) {
                    EyeOfEnder var4 = new EyeOfEnder(param0, param1.getX(), param1.getY(0.5), param1.getZ());
                    var4.setItem(var0);
                    var4.signalTo(var3);
                    param0.gameEvent(GameEvent.PROJECTILE_SHOOT, var4.position(), GameEvent.Context.of(param1));
                    param0.addFreshEntity(var4);
                    if (param1 instanceof ServerPlayer) {
                        CriteriaTriggers.USED_ENDER_EYE.trigger((ServerPlayer)param1, var3);
                    }

                    param0.playSound(
                        null,
                        param1.getX(),
                        param1.getY(),
                        param1.getZ(),
                        SoundEvents.ENDER_EYE_LAUNCH,
                        SoundSource.NEUTRAL,
                        0.5F,
                        0.4F / (param0.getRandom().nextFloat() * 0.4F + 0.8F)
                    );
                    param0.levelEvent(null, 1003, param1.blockPosition(), 0);
                    if (!param1.getAbilities().instabuild) {
                        var0.shrink(1);
                    }

                    param1.awardStat(Stats.ITEM_USED.get(this));
                    param1.swing(param2, true);
                    return InteractionResultHolder.success(var0);
                }
            }

            return InteractionResultHolder.consume(var0);
        }
    }
}
