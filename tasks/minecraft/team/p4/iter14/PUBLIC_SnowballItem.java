package net.minecraft.world.item;

import net.minecraft.sounds.SoundEvents;
import net.minecraft.sounds.SoundSource;
import net.minecraft.stats.Stats;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResultHolder;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.Snowball;
import net.minecraft.world.level.Level;

public class SnowballItem extends Item {
    public SnowballItem(Item.Properties param0) {
        super(param0);
    }

    @Override
    public InteractionResultHolder<ItemStack> use(Level param0, Player param1, InteractionHand param2) {
        ItemStack var0 = param1.getItemInHand(param2);
        param0.playSound(
            null,
            param1.getX(),
            param1.getY(),
            param1.getZ(),
            SoundEvents.SNOWBALL_THROW,
            SoundSource.NEUTRAL,
            0.5F,
            0.4F / (param0.getRandom().nextFloat() * 0.4F + 0.8F)
        );
        if (!param0.isClientSide) {
            Snowball var1 = new Snowball(param0, param1);
            var1.setItem(var0);
            var1.shootFromRotation(param1, param1.getXRot(), param1.getYRot(), 0.0F, 1.5F, 1.0F);
            param0.addFreshEntity(var1);
        }

        param1.awardStat(Stats.ITEM_USED.get(this));
        if (!param1.getAbilities().instabuild) {
            var0.shrink(1);
        }

        return InteractionResultHolder.sidedSuccess(var0, param0.isClientSide());
    }
}
