package net.minecraft.world.entity;

import com.google.common.collect.ImmutableSet;
import com.mojang.logging.LogUtils;
import java.util.List;
import java.util.Optional;
import java.util.Spliterator;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import javax.annotation.Nullable;
import net.minecraft.Util;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Holder;
import net.minecraft.core.HolderSet;
import net.minecraft.core.Registry;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.nbt.CompoundTag;
import net.minecraft.nbt.ListTag;
import net.minecraft.nbt.Tag;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.tags.TagKey;
import net.minecraft.util.Mth;
import net.minecraft.util.datafix.fixes.References;
import net.minecraft.world.entity.ambient.Bat;
import net.minecraft.world.entity.animal.Bee;
import net.minecraft.world.entity.animal.Cat;
import net.minecraft.world.entity.animal.Chicken;
import net.minecraft.world.entity.animal.Cod;
import net.minecraft.world.entity.animal.Cow;
import net.minecraft.world.entity.animal.Dolphin;
import net.minecraft.world.entity.animal.Fox;
import net.minecraft.world.entity.animal.IronGolem;
import net.minecraft.world.entity.animal.MushroomCow;
import net.minecraft.world.entity.animal.Ocelot;
import net.minecraft.world.entity.animal.Panda;
import net.minecraft.world.entity.animal.Parrot;
import net.minecraft.world.entity.animal.Pig;
import net.minecraft.world.entity.animal.PolarBear;
import net.minecraft.world.entity.animal.Pufferfish;
import net.minecraft.world.entity.animal.Rabbit;
import net.minecraft.world.entity.animal.Salmon;
import net.minecraft.world.entity.animal.Sheep;
import net.minecraft.world.entity.animal.SnowGolem;
import net.minecraft.world.entity.animal.Squid;
import net.minecraft.world.entity.animal.TropicalFish;
import net.minecraft.world.entity.animal.Turtle;
import net.minecraft.world.entity.animal.Wolf;
import net.minecraft.world.entity.animal.allay.Allay;
import net.minecraft.world.entity.animal.axolotl.Axolotl;
import net.minecraft.world.entity.animal.camel.Camel;
import net.minecraft.world.entity.animal.frog.Frog;
import net.minecraft.world.entity.animal.frog.Tadpole;
import net.minecraft.world.entity.animal.goat.Goat;
import net.minecraft.world.entity.animal.horse.Donkey;
import net.minecraft.world.entity.animal.horse.Horse;
import net.minecraft.world.entity.animal.horse.Llama;
import net.minecraft.world.entity.animal.horse.Mule;
import net.minecraft.world.entity.animal.horse.SkeletonHorse;
import net.minecraft.world.entity.animal.horse.TraderLlama;
import net.minecraft.world.entity.animal.horse.ZombieHorse;
import net.minecraft.world.entity.animal.sniffer.Sniffer;
import net.minecraft.world.entity.boss.enderdragon.EndCrystal;
import net.minecraft.world.entity.boss.enderdragon.EnderDragon;
import net.minecraft.world.entity.boss.wither.WitherBoss;
import net.minecraft.world.entity.decoration.ArmorStand;
import net.minecraft.world.entity.decoration.GlowItemFrame;
import net.minecraft.world.entity.decoration.ItemFrame;
import net.minecraft.world.entity.decoration.LeashFenceKnotEntity;
import net.minecraft.world.entity.decoration.Painting;
import net.minecraft.world.entity.item.FallingBlockEntity;
import net.minecraft.world.entity.item.ItemEntity;
import net.minecraft.world.entity.item.PrimedTnt;
import net.minecraft.world.entity.monster.Blaze;
import net.minecraft.world.entity.monster.CaveSpider;
import net.minecraft.world.entity.monster.Creeper;
import net.minecraft.world.entity.monster.Drowned;
import net.minecraft.world.entity.monster.ElderGuardian;
import net.minecraft.world.entity.monster.EnderMan;
import net.minecraft.world.entity.monster.Endermite;
import net.minecraft.world.entity.monster.Evoker;
import net.minecraft.world.entity.monster.Ghast;
import net.minecraft.world.entity.monster.Giant;
import net.minecraft.world.entity.monster.Guardian;
import net.minecraft.world.entity.monster.Husk;
import net.minecraft.world.entity.monster.Illusioner;
import net.minecraft.world.entity.monster.MagmaCube;
import net.minecraft.world.entity.monster.Phantom;
import net.minecraft.world.entity.monster.Pillager;
import net.minecraft.world.entity.monster.Ravager;
import net.minecraft.world.entity.monster.Shulker;
import net.minecraft.world.entity.monster.Silverfish;
import net.minecraft.world.entity.monster.Skeleton;
import net.minecraft.world.entity.monster.Slime;
import net.minecraft.world.entity.monster.Spider;
import net.minecraft.world.entity.monster.Stray;
import net.minecraft.world.entity.monster.Strider;
import net.minecraft.world.entity.monster.Vex;
import net.minecraft.world.entity.monster.Vindicator;
import net.minecraft.world.entity.monster.Witch;
import net.minecraft.world.entity.monster.WitherSkeleton;
import net.minecraft.world.entity.monster.Zoglin;
import net.minecraft.world.entity.monster.Zombie;
import net.minecraft.world.entity.monster.ZombieVillager;
import net.minecraft.world.entity.monster.ZombifiedPiglin;
import net.minecraft.world.entity.monster.breeze.Breeze;
import net.minecraft.world.entity.monster.hoglin.Hoglin;
import net.minecraft.world.entity.monster.piglin.Piglin;
import net.minecraft.world.entity.monster.piglin.PiglinBrute;
import net.minecraft.world.entity.monster.warden.Warden;
import net.minecraft.world.entity.npc.Villager;
import net.minecraft.world.entity.npc.WanderingTrader;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.projectile.Arrow;
import net.minecraft.world.entity.projectile.DragonFireball;
import net.minecraft.world.entity.projectile.EvokerFangs;
import net.minecraft.world.entity.projectile.EyeOfEnder;
import net.minecraft.world.entity.projectile.FireworkRocketEntity;
import net.minecraft.world.entity.projectile.FishingHook;
import net.minecraft.world.entity.projectile.LargeFireball;
import net.minecraft.world.entity.projectile.LlamaSpit;
import net.minecraft.world.entity.projectile.ShulkerBullet;
import net.minecraft.world.entity.projectile.SmallFireball;
import net.minecraft.world.entity.projectile.Snowball;
import net.minecraft.world.entity.projectile.SpectralArrow;
import net.minecraft.world.entity.projectile.ThrownEgg;
import net.minecraft.world.entity.projectile.ThrownEnderpearl;
import net.minecraft.world.entity.projectile.ThrownExperienceBottle;
import net.minecraft.world.entity.projectile.ThrownPotion;
import net.minecraft.world.entity.projectile.ThrownTrident;
import net.minecraft.world.entity.projectile.WindCharge;
import net.minecraft.world.entity.projectile.WitherSkull;
import net.minecraft.world.entity.vehicle.Boat;
import net.minecraft.world.entity.vehicle.ChestBoat;
import net.minecraft.world.entity.vehicle.Minecart;
import net.minecraft.world.entity.vehicle.MinecartChest;
import net.minecraft.world.entity.vehicle.MinecartCommandBlock;
import net.minecraft.world.entity.vehicle.MinecartFurnace;
import net.minecraft.world.entity.vehicle.MinecartHopper;
import net.minecraft.world.entity.vehicle.MinecartSpawner;
import net.minecraft.world.entity.vehicle.MinecartTNT;
import net.minecraft.world.flag.FeatureElement;
import net.minecraft.world.flag.FeatureFlag;
import net.minecraft.world.flag.FeatureFlagSet;
import net.minecraft.world.flag.FeatureFlags;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.Level;
import net.minecraft.world.level.LevelReader;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.entity.EntityTypeTest;
import net.minecraft.world.level.pathfinder.WalkNodeEvaluator;
import net.minecraft.world.phys.AABB;
import net.minecraft.world.phys.shapes.Shapes;
import net.minecraft.world.phys.shapes.VoxelShape;
import org.slf4j.Logger;

public class EntityType<T extends Entity> implements FeatureElement, EntityTypeTest<Entity, T> {
    private static final Logger LOGGER = LogUtils.getLogger();
    public static final String ENTITY_TAG = "EntityTag";
    private final Holder.Reference<EntityType<?>> builtInRegistryHolder = BuiltInRegistries.ENTITY_TYPE.createIntrusiveHolder(this);
    private static final float MAGIC_HORSE_WIDTH = 1.3964844F;
    private static final int DISPLAY_TRACKING_RANGE = 10;
    public static final EntityType<Allay> ALLAY = register(
        "allay", EntityType.Builder.<Allay>of(Allay::new, MobCategory.CREATURE).sized(0.35F, 0.6F).clientTrackingRange(8).updateInterval(2)
    );
    public static final EntityType<AreaEffectCloud> AREA_EFFECT_CLOUD = register(
        "area_effect_cloud",
        EntityType.Builder.<AreaEffectCloud>of(AreaEffectCloud::new, MobCategory.MISC)
            .fireImmune()
            .sized(6.0F, 0.5F)
            .clientTrackingRange(10)
            .updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<ArmorStand> ARMOR_STAND = register(
        "armor_stand", EntityType.Builder.<ArmorStand>of(ArmorStand::new, MobCategory.MISC).sized(0.5F, 1.975F).clientTrackingRange(10)
    );
    public static final EntityType<Arrow> ARROW = register(
        "arrow", EntityType.Builder.<Arrow>of(Arrow::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(4).updateInterval(20)
    );
    public static final EntityType<Axolotl> AXOLOTL = register(
        "axolotl", EntityType.Builder.<Axolotl>of(Axolotl::new, MobCategory.AXOLOTLS).sized(0.75F, 0.42F).clientTrackingRange(10)
    );
    public static final EntityType<Bat> BAT = register(
        "bat", EntityType.Builder.<Bat>of(Bat::new, MobCategory.AMBIENT).sized(0.5F, 0.9F).clientTrackingRange(5)
    );
    public static final EntityType<Bee> BEE = register(
        "bee", EntityType.Builder.<Bee>of(Bee::new, MobCategory.CREATURE).sized(0.7F, 0.6F).clientTrackingRange(8)
    );
    public static final EntityType<Blaze> BLAZE = register(
        "blaze", EntityType.Builder.<Blaze>of(Blaze::new, MobCategory.MONSTER).fireImmune().sized(0.6F, 1.8F).clientTrackingRange(8)
    );
    public static final EntityType<Display.BlockDisplay> BLOCK_DISPLAY = register(
        "block_display",
        EntityType.Builder.<Display.BlockDisplay>of(Display.BlockDisplay::new, MobCategory.MISC).sized(0.0F, 0.0F).clientTrackingRange(10).updateInterval(1)
    );
    public static final EntityType<Boat> BOAT = register(
        "boat", EntityType.Builder.<Boat>of(Boat::new, MobCategory.MISC).sized(1.375F, 0.5625F).clientTrackingRange(10)
    );
    public static final EntityType<Breeze> BREEZE = register(
        "breeze",
        EntityType.Builder.<Breeze>of(Breeze::new, MobCategory.MONSTER).sized(0.6F, 1.7F).clientTrackingRange(10).requiredFeatures(FeatureFlags.UPDATE_1_21)
    );
    public static final EntityType<Camel> CAMEL = register(
        "camel", EntityType.Builder.<Camel>of(Camel::new, MobCategory.CREATURE).sized(1.7F, 2.375F).clientTrackingRange(10)
    );
    public static final EntityType<Cat> CAT = register(
        "cat", EntityType.Builder.<Cat>of(Cat::new, MobCategory.CREATURE).sized(0.6F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<CaveSpider> CAVE_SPIDER = register(
        "cave_spider", EntityType.Builder.<CaveSpider>of(CaveSpider::new, MobCategory.MONSTER).sized(0.7F, 0.5F).clientTrackingRange(8)
    );
    public static final EntityType<ChestBoat> CHEST_BOAT = register(
        "chest_boat", EntityType.Builder.<ChestBoat>of(ChestBoat::new, MobCategory.MISC).sized(1.375F, 0.5625F).clientTrackingRange(10)
    );
    public static final EntityType<MinecartChest> CHEST_MINECART = register(
        "chest_minecart", EntityType.Builder.<MinecartChest>of(MinecartChest::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<Chicken> CHICKEN = register(
        "chicken", EntityType.Builder.<Chicken>of(Chicken::new, MobCategory.CREATURE).sized(0.4F, 0.7F).clientTrackingRange(10)
    );
    public static final EntityType<Cod> COD = register(
        "cod", EntityType.Builder.<Cod>of(Cod::new, MobCategory.WATER_AMBIENT).sized(0.5F, 0.3F).clientTrackingRange(4)
    );
    public static final EntityType<MinecartCommandBlock> COMMAND_BLOCK_MINECART = register(
        "command_block_minecart",
        EntityType.Builder.<MinecartCommandBlock>of(MinecartCommandBlock::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<Cow> COW = register(
        "cow", EntityType.Builder.<Cow>of(Cow::new, MobCategory.CREATURE).sized(0.9F, 1.4F).clientTrackingRange(10)
    );
    public static final EntityType<Creeper> CREEPER = register(
        "creeper", EntityType.Builder.<Creeper>of(Creeper::new, MobCategory.MONSTER).sized(0.6F, 1.7F).clientTrackingRange(8)
    );
    public static final EntityType<Dolphin> DOLPHIN = register(
        "dolphin", EntityType.Builder.<Dolphin>of(Dolphin::new, MobCategory.WATER_CREATURE).sized(0.9F, 0.6F)
    );
    public static final EntityType<Donkey> DONKEY = register(
        "donkey", EntityType.Builder.<Donkey>of(Donkey::new, MobCategory.CREATURE).sized(1.3964844F, 1.5F).clientTrackingRange(10)
    );
    public static final EntityType<DragonFireball> DRAGON_FIREBALL = register(
        "dragon_fireball",
        EntityType.Builder.<DragonFireball>of(DragonFireball::new, MobCategory.MISC).sized(1.0F, 1.0F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<Drowned> DROWNED = register(
        "drowned", EntityType.Builder.<Drowned>of(Drowned::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<ThrownEgg> EGG = register(
        "egg", EntityType.Builder.<ThrownEgg>of(ThrownEgg::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<ElderGuardian> ELDER_GUARDIAN = register(
        "elder_guardian", EntityType.Builder.<ElderGuardian>of(ElderGuardian::new, MobCategory.MONSTER).sized(1.9975F, 1.9975F).clientTrackingRange(10)
    );
    public static final EntityType<EndCrystal> END_CRYSTAL = register(
        "end_crystal",
        EntityType.Builder.<EndCrystal>of(EndCrystal::new, MobCategory.MISC).sized(2.0F, 2.0F).clientTrackingRange(16).updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<EnderDragon> ENDER_DRAGON = register(
        "ender_dragon", EntityType.Builder.<EnderDragon>of(EnderDragon::new, MobCategory.MONSTER).fireImmune().sized(16.0F, 8.0F).clientTrackingRange(10)
    );
    public static final EntityType<ThrownEnderpearl> ENDER_PEARL = register(
        "ender_pearl",
        EntityType.Builder.<ThrownEnderpearl>of(ThrownEnderpearl::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<EnderMan> ENDERMAN = register(
        "enderman", EntityType.Builder.<EnderMan>of(EnderMan::new, MobCategory.MONSTER).sized(0.6F, 2.9F).clientTrackingRange(8)
    );
    public static final EntityType<Endermite> ENDERMITE = register(
        "endermite", EntityType.Builder.<Endermite>of(Endermite::new, MobCategory.MONSTER).sized(0.4F, 0.3F).clientTrackingRange(8)
    );
    public static final EntityType<Evoker> EVOKER = register(
        "evoker", EntityType.Builder.<Evoker>of(Evoker::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<EvokerFangs> EVOKER_FANGS = register(
        "evoker_fangs", EntityType.Builder.<EvokerFangs>of(EvokerFangs::new, MobCategory.MISC).sized(0.5F, 0.8F).clientTrackingRange(6).updateInterval(2)
    );
    public static final EntityType<ThrownExperienceBottle> EXPERIENCE_BOTTLE = register(
        "experience_bottle",
        EntityType.Builder.<ThrownExperienceBottle>of(ThrownExperienceBottle::new, MobCategory.MISC)
            .sized(0.25F, 0.25F)
            .clientTrackingRange(4)
            .updateInterval(10)
    );
    public static final EntityType<ExperienceOrb> EXPERIENCE_ORB = register(
        "experience_orb",
        EntityType.Builder.<ExperienceOrb>of(ExperienceOrb::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(6).updateInterval(20)
    );
    public static final EntityType<EyeOfEnder> EYE_OF_ENDER = register(
        "eye_of_ender", EntityType.Builder.<EyeOfEnder>of(EyeOfEnder::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(4)
    );
    public static final EntityType<FallingBlockEntity> FALLING_BLOCK = register(
        "falling_block",
        EntityType.Builder.<FallingBlockEntity>of(FallingBlockEntity::new, MobCategory.MISC).sized(0.98F, 0.98F).clientTrackingRange(10).updateInterval(20)
    );
    public static final EntityType<FireworkRocketEntity> FIREWORK_ROCKET = register(
        "firework_rocket",
        EntityType.Builder.<FireworkRocketEntity>of(FireworkRocketEntity::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<Fox> FOX = register(
        "fox", EntityType.Builder.<Fox>of(Fox::new, MobCategory.CREATURE).sized(0.6F, 0.7F).clientTrackingRange(8).immuneTo(Blocks.SWEET_BERRY_BUSH)
    );
    public static final EntityType<Frog> FROG = register(
        "frog", EntityType.Builder.<Frog>of(Frog::new, MobCategory.CREATURE).sized(0.5F, 0.5F).clientTrackingRange(10)
    );
    public static final EntityType<MinecartFurnace> FURNACE_MINECART = register(
        "furnace_minecart", EntityType.Builder.<MinecartFurnace>of(MinecartFurnace::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<Ghast> GHAST = register(
        "ghast", EntityType.Builder.<Ghast>of(Ghast::new, MobCategory.MONSTER).fireImmune().sized(4.0F, 4.0F).clientTrackingRange(10)
    );
    public static final EntityType<Giant> GIANT = register(
        "giant", EntityType.Builder.<Giant>of(Giant::new, MobCategory.MONSTER).sized(3.6F, 12.0F).clientTrackingRange(10)
    );
    public static final EntityType<GlowItemFrame> GLOW_ITEM_FRAME = register(
        "glow_item_frame",
        EntityType.Builder.<GlowItemFrame>of(GlowItemFrame::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(10).updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<GlowSquid> GLOW_SQUID = register(
        "glow_squid", EntityType.Builder.<GlowSquid>of(GlowSquid::new, MobCategory.UNDERGROUND_WATER_CREATURE).sized(0.8F, 0.8F).clientTrackingRange(10)
    );
    public static final EntityType<Goat> GOAT = register(
        "goat", EntityType.Builder.<Goat>of(Goat::new, MobCategory.CREATURE).sized(0.9F, 1.3F).clientTrackingRange(10)
    );
    public static final EntityType<Guardian> GUARDIAN = register(
        "guardian", EntityType.Builder.<Guardian>of(Guardian::new, MobCategory.MONSTER).sized(0.85F, 0.85F).clientTrackingRange(8)
    );
    public static final EntityType<Hoglin> HOGLIN = register(
        "hoglin", EntityType.Builder.<Hoglin>of(Hoglin::new, MobCategory.MONSTER).sized(1.3964844F, 1.4F).clientTrackingRange(8)
    );
    public static final EntityType<MinecartHopper> HOPPER_MINECART = register(
        "hopper_minecart", EntityType.Builder.<MinecartHopper>of(MinecartHopper::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<Horse> HORSE = register(
        "horse", EntityType.Builder.<Horse>of(Horse::new, MobCategory.CREATURE).sized(1.3964844F, 1.6F).clientTrackingRange(10)
    );
    public static final EntityType<Husk> HUSK = register(
        "husk", EntityType.Builder.<Husk>of(Husk::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<Illusioner> ILLUSIONER = register(
        "illusioner", EntityType.Builder.<Illusioner>of(Illusioner::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<Interaction> INTERACTION = register(
        "interaction", EntityType.Builder.<Interaction>of(Interaction::new, MobCategory.MISC).sized(0.0F, 0.0F).clientTrackingRange(10)
    );
    public static final EntityType<IronGolem> IRON_GOLEM = register(
        "iron_golem", EntityType.Builder.<IronGolem>of(IronGolem::new, MobCategory.MISC).sized(1.4F, 2.7F).clientTrackingRange(10)
    );
    public static final EntityType<ItemEntity> ITEM = register(
        "item", EntityType.Builder.<ItemEntity>of(ItemEntity::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(6).updateInterval(20)
    );
    public static final EntityType<Display.ItemDisplay> ITEM_DISPLAY = register(
        "item_display",
        EntityType.Builder.<Display.ItemDisplay>of(Display.ItemDisplay::new, MobCategory.MISC).sized(0.0F, 0.0F).clientTrackingRange(10).updateInterval(1)
    );
    public static final EntityType<ItemFrame> ITEM_FRAME = register(
        "item_frame",
        EntityType.Builder.<ItemFrame>of(ItemFrame::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(10).updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<LargeFireball> FIREBALL = register(
        "fireball", EntityType.Builder.<LargeFireball>of(LargeFireball::new, MobCategory.MISC).sized(1.0F, 1.0F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<LeashFenceKnotEntity> LEASH_KNOT = register(
        "leash_knot",
        EntityType.Builder.<LeashFenceKnotEntity>of(LeashFenceKnotEntity::new, MobCategory.MISC)
            .noSave()
            .sized(0.375F, 0.5F)
            .clientTrackingRange(10)
            .updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<LightningBolt> LIGHTNING_BOLT = register(
        "lightning_bolt",
        EntityType.Builder.<LightningBolt>of(LightningBolt::new, MobCategory.MISC)
            .noSave()
            .sized(0.0F, 0.0F)
            .clientTrackingRange(16)
            .updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<Llama> LLAMA = register(
        "llama", EntityType.Builder.<Llama>of(Llama::new, MobCategory.CREATURE).sized(0.9F, 1.87F).clientTrackingRange(10)
    );
    public static final EntityType<LlamaSpit> LLAMA_SPIT = register(
        "llama_spit", EntityType.Builder.<LlamaSpit>of(LlamaSpit::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<MagmaCube> MAGMA_CUBE = register(
        "magma_cube", EntityType.Builder.<MagmaCube>of(MagmaCube::new, MobCategory.MONSTER).fireImmune().sized(2.04F, 2.04F).clientTrackingRange(8)
    );
    public static final EntityType<Marker> MARKER = register(
        "marker", EntityType.Builder.<Marker>of(Marker::new, MobCategory.MISC).sized(0.0F, 0.0F).clientTrackingRange(0)
    );
    public static final EntityType<Minecart> MINECART = register(
        "minecart", EntityType.Builder.<Minecart>of(Minecart::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<MushroomCow> MOOSHROOM = register(
        "mooshroom", EntityType.Builder.<MushroomCow>of(MushroomCow::new, MobCategory.CREATURE).sized(0.9F, 1.4F).clientTrackingRange(10)
    );
    public static final EntityType<Mule> MULE = register(
        "mule", EntityType.Builder.<Mule>of(Mule::new, MobCategory.CREATURE).sized(1.3964844F, 1.6F).clientTrackingRange(8)
    );
    public static final EntityType<Ocelot> OCELOT = register(
        "ocelot", EntityType.Builder.<Ocelot>of(Ocelot::new, MobCategory.CREATURE).sized(0.6F, 0.7F).clientTrackingRange(10)
    );
    public static final EntityType<Painting> PAINTING = register(
        "painting",
        EntityType.Builder.<Painting>of(Painting::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(10).updateInterval(Integer.MAX_VALUE)
    );
    public static final EntityType<Panda> PANDA = register(
        "panda", EntityType.Builder.<Panda>of(Panda::new, MobCategory.CREATURE).sized(1.3F, 1.25F).clientTrackingRange(10)
    );
    public static final EntityType<Parrot> PARROT = register(
        "parrot", EntityType.Builder.<Parrot>of(Parrot::new, MobCategory.CREATURE).sized(0.5F, 0.9F).clientTrackingRange(8)
    );
    public static final EntityType<Phantom> PHANTOM = register(
        "phantom", EntityType.Builder.<Phantom>of(Phantom::new, MobCategory.MONSTER).sized(0.9F, 0.5F).clientTrackingRange(8)
    );
    public static final EntityType<Pig> PIG = register(
        "pig", EntityType.Builder.<Pig>of(Pig::new, MobCategory.CREATURE).sized(0.9F, 0.9F).clientTrackingRange(10)
    );
    public static final EntityType<Piglin> PIGLIN = register(
        "piglin", EntityType.Builder.<Piglin>of(Piglin::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<PiglinBrute> PIGLIN_BRUTE = register(
        "piglin_brute", EntityType.Builder.<PiglinBrute>of(PiglinBrute::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<Pillager> PILLAGER = register(
        "pillager", EntityType.Builder.<Pillager>of(Pillager::new, MobCategory.MONSTER).canSpawnFarFromPlayer().sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<PolarBear> POLAR_BEAR = register(
        "polar_bear",
        EntityType.Builder.<PolarBear>of(PolarBear::new, MobCategory.CREATURE).immuneTo(Blocks.POWDER_SNOW).sized(1.4F, 1.4F).clientTrackingRange(10)
    );
    public static final EntityType<ThrownPotion> POTION = register(
        "potion", EntityType.Builder.<ThrownPotion>of(ThrownPotion::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<Pufferfish> PUFFERFISH = register(
        "pufferfish", EntityType.Builder.<Pufferfish>of(Pufferfish::new, MobCategory.WATER_AMBIENT).sized(0.7F, 0.7F).clientTrackingRange(4)
    );
    public static final EntityType<Rabbit> RABBIT = register(
        "rabbit", EntityType.Builder.<Rabbit>of(Rabbit::new, MobCategory.CREATURE).sized(0.4F, 0.5F).clientTrackingRange(8)
    );
    public static final EntityType<Ravager> RAVAGER = register(
        "ravager", EntityType.Builder.<Ravager>of(Ravager::new, MobCategory.MONSTER).sized(1.95F, 2.2F).clientTrackingRange(10)
    );
    public static final EntityType<Salmon> SALMON = register(
        "salmon", EntityType.Builder.<Salmon>of(Salmon::new, MobCategory.WATER_AMBIENT).sized(0.7F, 0.4F).clientTrackingRange(4)
    );
    public static final EntityType<Sheep> SHEEP = register(
        "sheep", EntityType.Builder.<Sheep>of(Sheep::new, MobCategory.CREATURE).sized(0.9F, 1.3F).clientTrackingRange(10)
    );
    public static final EntityType<Shulker> SHULKER = register(
        "shulker",
        EntityType.Builder.<Shulker>of(Shulker::new, MobCategory.MONSTER).fireImmune().canSpawnFarFromPlayer().sized(1.0F, 1.0F).clientTrackingRange(10)
    );
    public static final EntityType<ShulkerBullet> SHULKER_BULLET = register(
        "shulker_bullet", EntityType.Builder.<ShulkerBullet>of(ShulkerBullet::new, MobCategory.MISC).sized(0.3125F, 0.3125F).clientTrackingRange(8)
    );
    public static final EntityType<Silverfish> SILVERFISH = register(
        "silverfish", EntityType.Builder.<Silverfish>of(Silverfish::new, MobCategory.MONSTER).sized(0.4F, 0.3F).clientTrackingRange(8)
    );
    public static final EntityType<Skeleton> SKELETON = register(
        "skeleton", EntityType.Builder.<Skeleton>of(Skeleton::new, MobCategory.MONSTER).sized(0.6F, 1.99F).clientTrackingRange(8)
    );
    public static final EntityType<SkeletonHorse> SKELETON_HORSE = register(
        "skeleton_horse", EntityType.Builder.<SkeletonHorse>of(SkeletonHorse::new, MobCategory.CREATURE).sized(1.3964844F, 1.6F).clientTrackingRange(10)
    );
    public static final EntityType<Slime> SLIME = register(
        "slime", EntityType.Builder.<Slime>of(Slime::new, MobCategory.MONSTER).sized(2.04F, 2.04F).clientTrackingRange(10)
    );
    public static final EntityType<SmallFireball> SMALL_FIREBALL = register(
        "small_fireball",
        EntityType.Builder.<SmallFireball>of(SmallFireball::new, MobCategory.MISC).sized(0.3125F, 0.3125F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<Sniffer> SNIFFER = register(
        "sniffer", EntityType.Builder.<Sniffer>of(Sniffer::new, MobCategory.CREATURE).sized(1.9F, 1.75F).clientTrackingRange(10)
    );
    public static final EntityType<SnowGolem> SNOW_GOLEM = register(
        "snow_golem", EntityType.Builder.<SnowGolem>of(SnowGolem::new, MobCategory.MISC).immuneTo(Blocks.POWDER_SNOW).sized(0.7F, 1.9F).clientTrackingRange(8)
    );
    public static final EntityType<Snowball> SNOWBALL = register(
        "snowball", EntityType.Builder.<Snowball>of(Snowball::new, MobCategory.MISC).sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<MinecartSpawner> SPAWNER_MINECART = register(
        "spawner_minecart", EntityType.Builder.<MinecartSpawner>of(MinecartSpawner::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<SpectralArrow> SPECTRAL_ARROW = register(
        "spectral_arrow",
        EntityType.Builder.<SpectralArrow>of(SpectralArrow::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(4).updateInterval(20)
    );
    public static final EntityType<Spider> SPIDER = register(
        "spider", EntityType.Builder.<Spider>of(Spider::new, MobCategory.MONSTER).sized(1.4F, 0.9F).clientTrackingRange(8)
    );
    public static final EntityType<Squid> SQUID = register(
        "squid", EntityType.Builder.<Squid>of(Squid::new, MobCategory.WATER_CREATURE).sized(0.8F, 0.8F).clientTrackingRange(8)
    );
    public static final EntityType<Stray> STRAY = register(
        "stray", EntityType.Builder.<Stray>of(Stray::new, MobCategory.MONSTER).sized(0.6F, 1.99F).immuneTo(Blocks.POWDER_SNOW).clientTrackingRange(8)
    );
    public static final EntityType<Strider> STRIDER = register(
        "strider", EntityType.Builder.<Strider>of(Strider::new, MobCategory.CREATURE).fireImmune().sized(0.9F, 1.7F).clientTrackingRange(10)
    );
    public static final EntityType<Tadpole> TADPOLE = register(
        "tadpole",
        EntityType.Builder.<Tadpole>of(Tadpole::new, MobCategory.CREATURE).sized(Tadpole.HITBOX_WIDTH, Tadpole.HITBOX_HEIGHT).clientTrackingRange(10)
    );
    public static final EntityType<Display.TextDisplay> TEXT_DISPLAY = register(
        "text_display",
        EntityType.Builder.<Display.TextDisplay>of(Display.TextDisplay::new, MobCategory.MISC).sized(0.0F, 0.0F).clientTrackingRange(10).updateInterval(1)
    );
    public static final EntityType<PrimedTnt> TNT = register(
        "tnt", EntityType.Builder.<PrimedTnt>of(PrimedTnt::new, MobCategory.MISC).fireImmune().sized(0.98F, 0.98F).clientTrackingRange(10).updateInterval(10)
    );
    public static final EntityType<MinecartTNT> TNT_MINECART = register(
        "tnt_minecart", EntityType.Builder.<MinecartTNT>of(MinecartTNT::new, MobCategory.MISC).sized(0.98F, 0.7F).clientTrackingRange(8)
    );
    public static final EntityType<TraderLlama> TRADER_LLAMA = register(
        "trader_llama", EntityType.Builder.<TraderLlama>of(TraderLlama::new, MobCategory.CREATURE).sized(0.9F, 1.87F).clientTrackingRange(10)
    );
    public static final EntityType<ThrownTrident> TRIDENT = register(
        "trident", EntityType.Builder.<ThrownTrident>of(ThrownTrident::new, MobCategory.MISC).sized(0.5F, 0.5F).clientTrackingRange(4).updateInterval(20)
    );
    public static final EntityType<TropicalFish> TROPICAL_FISH = register(
        "tropical_fish", EntityType.Builder.<TropicalFish>of(TropicalFish::new, MobCategory.WATER_AMBIENT).sized(0.5F, 0.4F).clientTrackingRange(4)
    );
    public static final EntityType<Turtle> TURTLE = register(
        "turtle", EntityType.Builder.<Turtle>of(Turtle::new, MobCategory.CREATURE).sized(1.2F, 0.4F).clientTrackingRange(10)
    );
    public static final EntityType<Vex> VEX = register(
        "vex", EntityType.Builder.<Vex>of(Vex::new, MobCategory.MONSTER).fireImmune().sized(0.4F, 0.8F).clientTrackingRange(8)
    );
    public static final EntityType<Villager> VILLAGER = register(
        "villager", EntityType.Builder.<Villager>of(Villager::new, MobCategory.MISC).sized(0.6F, 1.95F).clientTrackingRange(10)
    );
    public static final EntityType<Vindicator> VINDICATOR = register(
        "vindicator", EntityType.Builder.<Vindicator>of(Vindicator::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<WanderingTrader> WANDERING_TRADER = register(
        "wandering_trader", EntityType.Builder.<WanderingTrader>of(WanderingTrader::new, MobCategory.CREATURE).sized(0.6F, 1.95F).clientTrackingRange(10)
    );
    public static final EntityType<Warden> WARDEN = register(
        "warden", EntityType.Builder.<Warden>of(Warden::new, MobCategory.MONSTER).sized(0.9F, 2.9F).clientTrackingRange(16).fireImmune()
    );
    public static final EntityType<WindCharge> WIND_CHARGE = register(
        "wind_charge", EntityType.Builder.<WindCharge>of(WindCharge::new, MobCategory.MISC).sized(0.3125F, 0.3125F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<Witch> WITCH = register(
        "witch", EntityType.Builder.<Witch>of(Witch::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<WitherBoss> WITHER = register(
        "wither",
        EntityType.Builder.<WitherBoss>of(WitherBoss::new, MobCategory.MONSTER)
            .fireImmune()
            .immuneTo(Blocks.WITHER_ROSE)
            .sized(0.9F, 3.5F)
            .clientTrackingRange(10)
    );
    public static final EntityType<WitherSkeleton> WITHER_SKELETON = register(
        "wither_skeleton",
        EntityType.Builder.<WitherSkeleton>of(WitherSkeleton::new, MobCategory.MONSTER)
            .fireImmune()
            .immuneTo(Blocks.WITHER_ROSE)
            .sized(0.7F, 2.4F)
            .clientTrackingRange(8)
    );
    public static final EntityType<WitherSkull> WITHER_SKULL = register(
        "wither_skull",
        EntityType.Builder.<WitherSkull>of(WitherSkull::new, MobCategory.MISC).sized(0.3125F, 0.3125F).clientTrackingRange(4).updateInterval(10)
    );
    public static final EntityType<Wolf> WOLF = register(
        "wolf", EntityType.Builder.<Wolf>of(Wolf::new, MobCategory.CREATURE).sized(0.6F, 0.85F).clientTrackingRange(10)
    );
    public static final EntityType<Zoglin> ZOGLIN = register(
        "zoglin", EntityType.Builder.<Zoglin>of(Zoglin::new, MobCategory.MONSTER).fireImmune().sized(1.3964844F, 1.4F).clientTrackingRange(8)
    );
    public static final EntityType<Zombie> ZOMBIE = register(
        "zombie", EntityType.Builder.<Zombie>of(Zombie::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<ZombieHorse> ZOMBIE_HORSE = register(
        "zombie_horse", EntityType.Builder.<ZombieHorse>of(ZombieHorse::new, MobCategory.CREATURE).sized(1.3964844F, 1.6F).clientTrackingRange(10)
    );
    public static final EntityType<ZombieVillager> ZOMBIE_VILLAGER = register(
        "zombie_villager", EntityType.Builder.<ZombieVillager>of(ZombieVillager::new, MobCategory.MONSTER).sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<ZombifiedPiglin> ZOMBIFIED_PIGLIN = register(
        "zombified_piglin",
        EntityType.Builder.<ZombifiedPiglin>of(ZombifiedPiglin::new, MobCategory.MONSTER).fireImmune().sized(0.6F, 1.95F).clientTrackingRange(8)
    );
    public static final EntityType<Player> PLAYER = register(
        "player", EntityType.Builder.<Player>createNothing(MobCategory.MISC).noSave().noSummon().sized(0.6F, 1.8F).clientTrackingRange(32).updateInterval(2)
    );
    public static final EntityType<FishingHook> FISHING_BOBBER = register(
        "fishing_bobber",
        EntityType.Builder.<FishingHook>of(FishingHook::new, MobCategory.MISC).noSave().noSummon().sized(0.25F, 0.25F).clientTrackingRange(4).updateInterval(5)
    );
    private final EntityType.EntityFactory<T> factory;
    private final MobCategory category;
    private final ImmutableSet<Block> immuneTo;
    private final boolean serialize;
    private final boolean summon;
    private final boolean fireImmune;
    private final boolean canSpawnFarFromPlayer;
    private final int clientTrackingRange;
    private final int updateInterval;
    @Nullable
    private String descriptionId;
    @Nullable
    private Component description;
    @Nullable
    private ResourceLocation lootTable;
    private final EntityDimensions dimensions;
    private final FeatureFlagSet requiredFeatures;

    private static <T extends Entity> EntityType<T> register(String param0, EntityType.Builder<T> param1) {
        return Registry.register(BuiltInRegistries.ENTITY_TYPE, param0, param1.build(param0));
    }

    public static ResourceLocation getKey(EntityType<?> param0) {
        return BuiltInRegistries.ENTITY_TYPE.getKey(param0);
    }

    public static Optional<EntityType<?>> byString(String param0) {
        return BuiltInRegistries.ENTITY_TYPE.getOptional(ResourceLocation.tryParse(param0));
    }

    public EntityType(
        EntityType.EntityFactory<T> param0,
        MobCategory param1,
        boolean param2,
        boolean param3,
        boolean param4,
        boolean param5,
        ImmutableSet<Block> param6,
        EntityDimensions param7,
        int param8,
        int param9,
        FeatureFlagSet param10
    ) {
        this.factory = param0;
        this.category = param1;
        this.canSpawnFarFromPlayer = param5;
        this.serialize = param2;
        this.summon = param3;
        this.fireImmune = param4;
        this.immuneTo = param6;
        this.dimensions = param7;
        this.clientTrackingRange = param8;
        this.updateInterval = param9;
        this.requiredFeatures = param10;
    }

    @Nullable
    public T spawn(
        ServerLevel param0, @Nullable ItemStack param1, @Nullable Player param2, BlockPos param3, MobSpawnType param4, boolean param5, boolean param6
    ) {
        Consumer<T> var1;
        CompoundTag var0;
        if (param1 != null) {
            var0 = param1.getTag();
            var1 = createDefaultStackConfig(param0, param1, param2);
        } else {
            var1 = param0x -> {
            };
            var0 = null;
        }

        return this.spawn(param0, var0, var1, param3, param4, param5, param6);
    }

    public static <T extends Entity> Consumer<T> createDefaultStackConfig(ServerLevel param0, ItemStack param1, @Nullable Player param2) {
        return appendDefaultStackConfig(param0x -> {
        }, param0, param1, param2);
    }

    public static <T extends Entity> Consumer<T> appendDefaultStackConfig(Consumer<T> param0, ServerLevel param1, ItemStack param2, @Nullable Player param3) {
        return appendCustomEntityStackConfig(appendCustomNameConfig(param0, param2), param1, param2, param3);
    }

    public static <T extends Entity> Consumer<T> appendCustomNameConfig(Consumer<T> param0, ItemStack param1) {
        return param1.hasCustomHoverName() ? param0.andThen(param1x -> param1x.setCustomName(param1.getHoverName())) : param0;
    }

    public static <T extends Entity> Consumer<T> appendCustomEntityStackConfig(
        Consumer<T> param0, ServerLevel param1, ItemStack param2, @Nullable Player param3
    ) {
        CompoundTag var0 = param2.getTag();
        return var0 != null ? param0.andThen(param3x -> updateCustomEntityTag(param1, param3, param3x, var0)) : param0;
    }

    @Nullable
    public T spawn(ServerLevel param0, BlockPos param1, MobSpawnType param2) {
        return this.spawn(param0, (CompoundTag)null, null, param1, param2, false, false);
    }

    @Nullable
    public T spawn(
        ServerLevel param0, @Nullable CompoundTag param1, @Nullable Consumer<T> param2, BlockPos param3, MobSpawnType param4, boolean param5, boolean param6
    ) {
        T var0 = this.create(param0, param1, param2, param3, param4, param5, param6);
        if (var0 != null) {
            param0.addFreshEntityWithPassengers(var0);
        }

        return var0;
    }

    @Nullable
    public T create(
        ServerLevel param0, @Nullable CompoundTag param1, @Nullable Consumer<T> param2, BlockPos param3, MobSpawnType param4, boolean param5, boolean param6
    ) {
        T var0 = this.create(param0);
        if (var0 == null) {
            return null;
        } else {
            double var1;
            if (param5) {
                var0.setPos((double)param3.getX() + 0.5, (double)(param3.getY() + 1), (double)param3.getZ() + 0.5);
                var1 = getYOffset(param0, param3, param6, var0.getBoundingBox());
            } else {
                var1 = 0.0;
            }

            var0.moveTo(
                (double)param3.getX() + 0.5,
                (double)param3.getY() + var1,
                (double)param3.getZ() + 0.5,
                Mth.wrapDegrees(param0.random.nextFloat() * 360.0F),
                0.0F
            );
            if (var0 instanceof Mob var3) {
                var3.yHeadRot = var3.getYRot();
                var3.yBodyRot = var3.getYRot();
                var3.finalizeSpawn(param0, param0.getCurrentDifficultyAt(var3.blockPosition()), param4, null, param1);
                var3.playAmbientSound();
            }

            if (param2 != null) {
                param2.accept(var0);
            }

            return var0;
        }
    }

    protected static double getYOffset(LevelReader param0, BlockPos param1, boolean param2, AABB param3) {
        AABB var0 = new AABB(param1);
        if (param2) {
            var0 = var0.expandTowards(0.0, -1.0, 0.0);
        }

        Iterable<VoxelShape> var1 = param0.getCollisions(null, var0);
        return 1.0 + Shapes.collide(Direction.Axis.Y, param3, var1, param2 ? -2.0 : -1.0);
    }

    public static void updateCustomEntityTag(Level param0, @Nullable Player param1, @Nullable Entity param2, @Nullable CompoundTag param3) {
        if (param3 != null && param3.contains("EntityTag", 10)) {
            MinecraftServer var0 = param0.getServer();
            if (var0 != null && param2 != null) {
                if (param0.isClientSide || !param2.onlyOpCanSetNbt() || param1 != null && var0.getPlayerList().isOp(param1.getGameProfile())) {
                    CompoundTag var1 = param2.saveWithoutId(new CompoundTag());
                    UUID var2 = param2.getUUID();
                    var1.merge(param3.getCompound("EntityTag"));
                    param2.setUUID(var2);
                    param2.load(var1);
                }
            }
        }
    }

    public boolean canSerialize() {
        return this.serialize;
    }

    public boolean canSummon() {
        return this.summon;
    }

    public boolean fireImmune() {
        return this.fireImmune;
    }

    public boolean canSpawnFarFromPlayer() {
        return this.canSpawnFarFromPlayer;
    }

    public MobCategory getCategory() {
        return this.category;
    }

    public String getDescriptionId() {
        if (this.descriptionId == null) {
            this.descriptionId = Util.makeDescriptionId("entity", BuiltInRegistries.ENTITY_TYPE.getKey(this));
        }

        return this.descriptionId;
    }

    public Component getDescription() {
        if (this.description == null) {
            this.description = Component.translatable(this.getDescriptionId());
        }

        return this.description;
    }

    @Override
    public String toString() {
        return this.getDescriptionId();
    }

    public String toShortString() {
        int var0 = this.getDescriptionId().lastIndexOf(46);
        return var0 == -1 ? this.getDescriptionId() : this.getDescriptionId().substring(var0 + 1);
    }

    public ResourceLocation getDefaultLootTable() {
        if (this.lootTable == null) {
            ResourceLocation var0 = BuiltInRegistries.ENTITY_TYPE.getKey(this);
            this.lootTable = var0.withPrefix("entities/");
        }

        return this.lootTable;
    }

    public float getWidth() {
        return this.dimensions.width;
    }

    public float getHeight() {
        return this.dimensions.height;
    }

    @Override
    public FeatureFlagSet requiredFeatures() {
        return this.requiredFeatures;
    }

    @Nullable
    public T create(Level param0) {
        return !this.isEnabled(param0.enabledFeatures()) ? null : this.factory.create(this, param0);
    }

    public static Optional<Entity> create(CompoundTag param0, Level param1) {
        return Util.ifElse(
            by(param0).map(param1x -> param1x.create(param1)),
            param1x -> param1x.load(param0),
            () -> LOGGER.warn("Skipping Entity with id {}", param0.getString("id"))
        );
    }

    public AABB getAABB(double param0, double param1, double param2) {
        float var0 = this.getWidth() / 2.0F;
        return new AABB(param0 - (double)var0, param1, param2 - (double)var0, param0 + (double)var0, param1 + (double)this.getHeight(), param2 + (double)var0);
    }

    public boolean isBlockDangerous(BlockState param0) {
        if (this.immuneTo.contains(param0.getBlock())) {
            return false;
        } else if (!this.fireImmune && WalkNodeEvaluator.isBurningBlock(param0)) {
            return true;
        } else {
            return param0.is(Blocks.WITHER_ROSE) || param0.is(Blocks.SWEET_BERRY_BUSH) || param0.is(Blocks.CACTUS) || param0.is(Blocks.POWDER_SNOW);
        }
    }

    public EntityDimensions getDimensions() {
        return this.dimensions;
    }

    public static Optional<EntityType<?>> by(CompoundTag param0) {
        return BuiltInRegistries.ENTITY_TYPE.getOptional(new ResourceLocation(param0.getString("id")));
    }

    @Nullable
    public static Entity loadEntityRecursive(CompoundTag param0, Level param1, Function<Entity, Entity> param2) {
        return loadStaticEntity(param0, param1).map(param2).map(param3 -> {
            if (param0.contains("Passengers", 9)) {
                ListTag var0x = param0.getList("Passengers", 10);

                for(int var1x = 0; var1x < var0x.size(); ++var1x) {
                    Entity var2x = loadEntityRecursive(var0x.getCompound(var1x), param1, param2);
                    if (var2x != null) {
                        var2x.startRiding(param3, true);
                    }
                }
            }

            return param3;
        }).orElse(null);
    }

    public static Stream<Entity> loadEntitiesRecursive(final List<? extends Tag> param0, final Level param1) {
        final Spliterator<? extends Tag> var0 = param0.spliterator();
        return StreamSupport.stream(new Spliterator<Entity>() {
            @Override
            public boolean tryAdvance(Consumer<? super Entity> param0x) {
                return var0.tryAdvance(param2 -> EntityType.loadEntityRecursive((CompoundTag)param2, param1, param1xxx -> {
                        param0.accept(param1xxx);
                        return param1xxx;
                    }));
            }

            @Override
            public Spliterator<Entity> trySplit() {
                return null;
            }

            @Override
            public long estimateSize() {
                return (long)param0.size();
            }

            @Override
            public int characteristics() {
                return 1297;
            }
        }, false);
    }

    private static Optional<Entity> loadStaticEntity(CompoundTag param0, Level param1) {
        try {
            return create(param0, param1);
        } catch (RuntimeException var3) {
            LOGGER.warn("Exception loading entity: ", (Throwable)var3);
            return Optional.empty();
        }
    }

    public int clientTrackingRange() {
        return this.clientTrackingRange;
    }

    public int updateInterval() {
        return this.updateInterval;
    }

    public boolean trackDeltas() {
        return this != PLAYER
            && this != LLAMA_SPIT
            && this != WITHER
            && this != BAT
            && this != ITEM_FRAME
            && this != GLOW_ITEM_FRAME
            && this != LEASH_KNOT
            && this != PAINTING
            && this != END_CRYSTAL
            && this != EVOKER_FANGS;
    }

    public boolean is(TagKey<EntityType<?>> param0) {
        return this.builtInRegistryHolder.is(param0);
    }

    public boolean is(HolderSet<EntityType<?>> param0) {
        return param0.contains(this.builtInRegistryHolder);
    }

    @Nullable
    public T tryCast(Entity param0) {
        return (T)(param0.getType() == this ? param0 : null);
    }

    @Override
    public Class<? extends Entity> getBaseClass() {
        return Entity.class;
    }

    @Deprecated
    public Holder.Reference<EntityType<?>> builtInRegistryHolder() {
        return this.builtInRegistryHolder;
    }

    public static class Builder<T extends Entity> {
        private final EntityType.EntityFactory<T> factory;
        private final MobCategory category;
        private ImmutableSet<Block> immuneTo = ImmutableSet.of();
        private boolean serialize = true;
        private boolean summon = true;
        private boolean fireImmune;
        private boolean canSpawnFarFromPlayer;
        private int clientTrackingRange = 5;
        private int updateInterval = 3;
        private EntityDimensions dimensions = EntityDimensions.scalable(0.6F, 1.8F);
        private FeatureFlagSet requiredFeatures = FeatureFlags.VANILLA_SET;

        private Builder(EntityType.EntityFactory<T> param0, MobCategory param1) {
            this.factory = param0;
            this.category = param1;
            this.canSpawnFarFromPlayer = param1 == MobCategory.CREATURE || param1 == MobCategory.MISC;
        }

        public static <T extends Entity> EntityType.Builder<T> of(EntityType.EntityFactory<T> param0, MobCategory param1) {
            return new EntityType.Builder<>(param0, param1);
        }

        public static <T extends Entity> EntityType.Builder<T> createNothing(MobCategory param0) {
            return new EntityType.Builder<>((param0x, param1) -> null, param0);
        }

        public EntityType.Builder<T> sized(float param0, float param1) {
            this.dimensions = EntityDimensions.scalable(param0, param1);
            return this;
        }

        public EntityType.Builder<T> noSummon() {
            this.summon = false;
            return this;
        }

        public EntityType.Builder<T> noSave() {
            this.serialize = false;
            return this;
        }

        public EntityType.Builder<T> fireImmune() {
            this.fireImmune = true;
            return this;
        }

        public EntityType.Builder<T> immuneTo(Block... param0) {
            this.immuneTo = ImmutableSet.copyOf(param0);
            return this;
        }

        public EntityType.Builder<T> canSpawnFarFromPlayer() {
            this.canSpawnFarFromPlayer = true;
            return this;
        }

        public EntityType.Builder<T> clientTrackingRange(int param0) {
            this.clientTrackingRange = param0;
            return this;
        }

        public EntityType.Builder<T> updateInterval(int param0) {
            this.updateInterval = param0;
            return this;
        }

        public EntityType.Builder<T> requiredFeatures(FeatureFlag... param0) {
            this.requiredFeatures = FeatureFlags.REGISTRY.subset(param0);
            return this;
        }

        public EntityType<T> build(String param0) {
            if (this.serialize) {
                Util.fetchChoiceType(References.ENTITY_TREE, param0);
            }

            return new EntityType<>(
                this.factory,
                this.category,
                this.serialize,
                this.summon,
                this.fireImmune,
                this.canSpawnFarFromPlayer,
                this.immuneTo,
                this.dimensions,
                this.clientTrackingRange,
                this.updateInterval,
                this.requiredFeatures
            );
        }
    }

    public interface EntityFactory<T extends Entity> {
        T create(EntityType<T> var1, Level var2);
    }
}
