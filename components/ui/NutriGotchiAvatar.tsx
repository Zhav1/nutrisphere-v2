'use client';

import { motion } from 'framer-motion';
import { Mood } from '@/types/user';
import { Accessory } from '@/types/accessory';
import {
  ACCESSORY_COMPONENTS,
  BACKGROUND_GRADIENTS,
  KitchenBackgroundSVG,
  KitchenSceneSVG,
  GardenBackgroundSVG,
  GardenSceneSVG,
  BeachBackgroundSVG,
  BeachSceneSVG,
  MountainBackgroundSVG,
  MountainSceneSVG,
  CityBackgroundSVG,
  CitySceneSVG,
  SpaceBackgroundSVG,
  SpaceSceneSVG,
} from '@/lib/data/accessorySVGs';

interface NutriGotchiAvatarProps {
  mood?: Mood;
  health?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  onClick?: () => void;
  equippedAccessories?: Accessory[];
  className?: string;
  showHealthBar?: boolean;
}

/**
 * NutriGotchiAvatar - Duolingo-style animated character
 * Features:
 * - Layered SVG rendering system
 * - Proper accessory slots (hat, outfit, pet, background)
 * - Smooth animations with blink cycle
 * - Health-based body color with gradient
 */
export default function NutriGotchiAvatar({
  mood = 'neutral',
  health = 100,
  size = 'md',
  animate = true,
  onClick,
  equippedAccessories = [],
  className = '',
  showHealthBar = true,
}: NutriGotchiAvatarProps) {
  const sizeConfig = {
    xs: { container: 'w-12 h-12', avatar: 48, healthBar: 'w-10' },
    sm: { container: 'w-24 h-24', avatar: 96, healthBar: 'w-20' },
    md: { container: 'w-32 h-32', avatar: 128, healthBar: 'w-28' },
    lg: { container: 'w-48 h-48', avatar: 192, healthBar: 'w-40' },
    xl: { container: 'w-64 h-64', avatar: 256, healthBar: 'w-56' },
  };

  const config = sizeConfig[size];

  // Health-based gradient colors
  const getHealthGradient = () => {
    if (health >= 80) return { start: '#34d399', end: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' };
    if (health >= 50) return { start: '#fbbf24', end: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' };
    return { start: '#f87171', end: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' };
  };

  // Mood-based expressions
  const getExpression = () => {
    switch (mood) {
      case 'happy':
        return {
          leftEye: { cx: 38, cy: 42, pupilY: 42 },
          rightEye: { cx: 62, cy: 42, pupilY: 42 },
          mouth: 'M 40 58 Q 50 68 60 58',
          eyeShape: 'happy', // Curved/smiling eyes
          showBlush: true,
        };
      case 'sick':
        return {
          leftEye: { cx: 38, cy: 44, pupilY: 45 },
          rightEye: { cx: 62, cy: 44, pupilY: 45 },
          mouth: 'M 42 62 Q 50 56 58 62',
          eyeShape: 'tired',
          showBlush: false,
        };
      default: // neutral
        return {
          leftEye: { cx: 38, cy: 42, pupilY: 42 },
          rightEye: { cx: 62, cy: 42, pupilY: 42 },
          mouth: 'M 42 58 L 58 58',
          eyeShape: 'normal',
          showBlush: false,
        };
    }
  };

  // Get equipped accessory by category
  const getAccessory = (category: string): Accessory | undefined => {
    return equippedAccessories.find(a => a.category === category);
  };

  const healthColors = getHealthGradient();
  const expression = getExpression();

  const hatAccessory = getAccessory('hat');
  const outfitAccessory = getAccessory('outfit');
  const petAccessory = getAccessory('pet');
  const backgroundAccessory = getAccessory('background');

  // Generate unique IDs for this instance to prevent SVG clashes in lists
  const instanceId = Math.random().toString(36).substring(7);
  const ids = {
    bodyGradient: `bodyGradient-${instanceId}`,
    bodyHighlight: `bodyHighlight-${instanceId}`,
    shadowGradient: `shadowGradient-${instanceId}`,
  };

  // Get background gradient ID
  const getBackgroundGradientId = () => {
    if (!backgroundAccessory) return null;
    const bgName = backgroundAccessory.name;
    if (bgName.includes('Kitchen')) return `kitchenBg-${instanceId}`;
    if (bgName.includes('Garden')) return `gardenBg-${instanceId}`;
    if (bgName.includes('Beach')) return `beachBg-${instanceId}`;
    if (bgName.includes('Mountain')) return `mountainBg-${instanceId}`;
    if (bgName.includes('City')) return `cityBg-${instanceId}`;
    if (bgName.includes('Space')) return `spaceBg-${instanceId}`;
    return null;
  };

  const bgGradientId = getBackgroundGradientId();

  // Render accessory component
  const renderAccessoryComponent = (accessory: Accessory | undefined, defaultSize: number) => {
    if (!accessory) return null;
    const Component = ACCESSORY_COMPONENTS[accessory.name];
    if (!Component) return null;
    return <Component size={defaultSize} instanceId={`-${instanceId}`} />;
  };


  return (
    <motion.div
      className={`${config.container} relative cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={animate ? { scale: 1.05 } : {}}
      whileTap={animate ? { scale: 0.95 } : {}}
    >
      {/* Main SVG Avatar */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 4px 6px ${healthColors.glow})` }}
        animate={animate ? {
          y: [0, -3, 0],
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* ============================================ */}
        {/* LAYER 0: Background Gradient Definitions */}
        {/* ============================================ */}
        <defs>
          {/* Body gradient */}
          <linearGradient id={ids.bodyGradient} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={healthColors.start} />
            <stop offset="100%" stopColor={healthColors.end} />
          </linearGradient>

          {/* Body highlight */}
          <radialGradient id={ids.bodyHighlight} cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Shadow gradient */}
          <radialGradient id={ids.shadowGradient} cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Background gradients */}
          {bgGradientId?.includes('kitchen') && <KitchenBackgroundSVG instanceId={`-${instanceId}`} />}
          {bgGradientId?.includes('garden') && <GardenBackgroundSVG instanceId={`-${instanceId}`} />}
          {bgGradientId?.includes('beach') && <BeachBackgroundSVG instanceId={`-${instanceId}`} />}
          {bgGradientId?.includes('mountain') && <MountainBackgroundSVG instanceId={`-${instanceId}`} />}
          {bgGradientId?.includes('city') && <CityBackgroundSVG instanceId={`-${instanceId}`} />}
          {bgGradientId?.includes('space') && <SpaceBackgroundSVG instanceId={`-${instanceId}`} />}
        </defs>

        {/* ============================================ */}
        {/* LAYER 1: Background Circle (if equipped) */}
        {/* ============================================ */}
        {bgGradientId && (
          <circle
            cx="50"
            cy="52"
            r="46"
            fill={`url(#${bgGradientId})`}
            opacity="0.8"
          />
        )}

        {/* ============================================ */}
        {/* LAYER 1.5: Background Scene Elements */}
        {/* ============================================ */}
        {bgGradientId?.includes('kitchen') && <KitchenSceneSVG />}
        {bgGradientId?.includes('garden') && <GardenSceneSVG />}
        {bgGradientId?.includes('beach') && <BeachSceneSVG />}
        {bgGradientId?.includes('mountain') && <MountainSceneSVG />}
        {bgGradientId?.includes('city') && <CitySceneSVG />}
        {bgGradientId?.includes('space') && <SpaceSceneSVG />}

        {/* ============================================ */}
        {/* LAYER 2: Ground Shadow */}
        {/* ============================================ */}
        <ellipse
          cx="50"
          cy="92"
          rx="25"
          ry="5"
          fill={`url(#${ids.shadowGradient})`}
        />

        {/* ============================================ */}
        {/* LAYER 3: Main Body */}
        {/* ============================================ */}
        <motion.rect
          x="22"
          y="28"
          width="56"
          height="58"
          rx="28"
          fill={`url(#${ids.bodyGradient})`}
          animate={animate ? {
            height: [58, 60, 58],
            y: [28, 27, 28],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* ============================================ */}
        {/* LAYER 4: Body Highlight (3D effect) */}
        {/* ============================================ */}
        <ellipse
          cx="40"
          cy="42"
          rx="12"
          ry="10"
          fill={`url(#${ids.bodyHighlight})`}
        />

        {/* ============================================ */}
        {/* LAYER 5: Health Glow Ring (when healthy) */}
        {/* ============================================ */}
        {health >= 80 && (
          <motion.rect
            x="18"
            y="24"
            width="64"
            height="66"
            rx="32"
            fill="none"
            stroke={healthColors.start}
            strokeWidth="2"
            opacity="0.3"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}

        {/* ============================================ */}
        {/* LAYER 6: Eyes */}
        {/* ============================================ */}
        {expression.eyeShape === 'happy' ? (
          // Happy curved eyes (^_^)
          <>
            <path
              d="M 32 42 Q 38 36 44 42"
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 56 42 Q 62 36 68 42"
              stroke="#1f2937"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : expression.eyeShape === 'tired' ? (
          // Tired droopy eyes
          <>
            <ellipse cx={expression.leftEye.cx} cy={expression.leftEye.pupilY} rx="6" ry="4" fill="#1f2937" />
            <ellipse cx={expression.rightEye.cx} cy={expression.rightEye.pupilY} rx="6" ry="4" fill="#1f2937" />
            {/* Droopy eyelids */}
            <path d="M 30 40 L 46 42" stroke="#1f2937" strokeWidth="2" />
            <path d="M 54 42 L 70 40" stroke="#1f2937" strokeWidth="2" />
          </>
        ) : (
          // Normal round eyes with shine
          <>
            {/* Eye whites */}
            <ellipse cx={expression.leftEye.cx} cy={expression.leftEye.pupilY} rx="8" ry="9" fill="#FFFFFF" />
            <ellipse cx={expression.rightEye.cx} cy={expression.rightEye.pupilY} rx="8" ry="9" fill="#FFFFFF" />

            {/* Pupils */}
            <motion.ellipse
              cx={expression.leftEye.cx}
              cy={expression.leftEye.pupilY}
              rx="5"
              ry="6"
              fill="#1f2937"
              animate={animate ? {
                scaleY: [1, 0.1, 1], // Blink animation
              } : {}}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
            />
            <motion.ellipse
              cx={expression.rightEye.cx}
              cy={expression.rightEye.pupilY}
              rx="5"
              ry="6"
              fill="#1f2937"
              animate={animate ? {
                scaleY: [1, 0.1, 1],
              } : {}}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
            />

            {/* Eye shine */}
            <circle cx={expression.leftEye.cx - 2} cy={expression.leftEye.pupilY - 2} r="2" fill="#FFFFFF" />
            <circle cx={expression.rightEye.cx - 2} cy={expression.rightEye.pupilY - 2} r="2" fill="#FFFFFF" />
          </>
        )}

        {/* ============================================ */}
        {/* LAYER 7: Blush (happy mood) */}
        {/* ============================================ */}
        {expression.showBlush && (
          <>
            <ellipse cx="28" cy="52" rx="5" ry="3" fill="#ff9eb5" opacity="0.5" />
            <ellipse cx="72" cy="52" rx="5" ry="3" fill="#ff9eb5" opacity="0.5" />
          </>
        )}

        {/* ============================================ */}
        {/* LAYER 8: Mouth */}
        {/* ============================================ */}
        <motion.path
          d={expression.mouth}
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* ============================================ */}
        {/* LAYER 8: Mouth */}
        {/* ============================================ */}
        <motion.path
          d={expression.mouth}
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>

      {/* ============================================ */}
      {/* LAYER 9: Outfit (Positioned overlay instead of foreignObject) */}
      {/* ============================================ */}
      {outfitAccessory && (
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] flex items-center justify-center z-10 pointer-events-none">
          {renderAccessoryComponent(outfitAccessory, config.avatar * 0.5)}
        </div>
      )}

      {/* ============================================ */}
      {/* LAYER 10: Hat (positioned above avatar) */}
      {/* ============================================ */}
      {hatAccessory && (
        <motion.div
          className="absolute -top-[-3%] left-[35%] -translate-x-1/2 z-20"
          animate={animate ? {
            rotate: [-2, 2, -2],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {renderAccessoryComponent(hatAccessory, config.avatar * 0.35)}
        </motion.div>
      )}

      {/* ============================================ */}
      {/* LAYER 11: Pet Companion (beside avatar) */}
      {/* ============================================ */}
      {petAccessory && (
        <motion.div
          className="absolute right-[0%] bottom-[0%] z-20"
          animate={animate ? {
            y: [0, -4, 0],
            rotate: [0, 5, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {renderAccessoryComponent(petAccessory, config.avatar * 0.25)}
        </motion.div>
      )}

      {/* ============================================ */}
      {/* Health Bar */}
      {/* ============================================ */}
      {showHealthBar && (
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${config.healthBar} h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner`}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${healthColors.end}, ${healthColors.start})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.div>
  );
}
