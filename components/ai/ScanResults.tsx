'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { VisionScanResult } from '@/types/scan';
import { HealthGrade } from '@/types/user';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import InputModal from '@/components/ui/InputModal';
import NutritionEditModal from '@/components/ui/NutritionEditModal';
import LivingBackground from '@/components/ui/LivingBackground';
import { HEALTH_GRADE_CONFIG } from '@/lib/uiConfig';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
}

interface ScanResultsProps {
  result: VisionScanResult;
  onSave: (foodName: string, editedNutrition?: NutritionData) => void;
  onEdit: () => void;
  onRescan: () => void;
}

export default function ScanResults({
  result,
  onSave,
  onEdit,
  onRescan,
}: ScanResultsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const gradeConfig = HEALTH_GRADE_CONFIG[result.healthGrade];

  // Local editable nutrition data
  const [editedNutrition, setEditedNutrition] = useState<NutritionData>({
    calories: result.nutritionData?.calories ?? 0,
    protein: result.nutritionData?.protein ?? 0,
    carbs: result.nutritionData?.carbs ?? 0,
    fat: result.nutritionData?.fat ?? 0,
    sugar: result.nutritionData?.sugar ?? 0,
    sodium: result.nutritionData?.sodium ?? 0,
  });

  // Sync with result when it changes
  useEffect(() => {
    setEditedNutrition({
      calories: result.nutritionData?.calories ?? 0,
      protein: result.nutritionData?.protein ?? 0,
      carbs: result.nutritionData?.carbs ?? 0,
      fat: result.nutritionData?.fat ?? 0,
      sugar: result.nutritionData?.sugar ?? 0,
      sodium: result.nutritionData?.sodium ?? 0,
    });
  }, [result]);

  const explanation = result.laymanExplanation || '';

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = (data: NutritionData) => {
    setEditedNutrition(data);
    toast.success('Nilai nutrisi berhasil diperbarui! ✏️');
  };

  const handleConfirmSave = (foodName: string) => {
    setIsModalOpen(false);
    onSave(foodName, editedNutrition);
    toast.success(`"${foodName}" berhasil disimpan ke riwayat! 🎉`, {
      duration: 3000,
      icon: '💾',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* LIVING ATMOSPHERE - Same as Dashboard */}
      {/* LIVING ATMOSPHERE */}
      <LivingBackground />

      {/* MAIN CONTENT */}
      <motion.div
        className="relative z-10 py-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="max-w-md mx-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header with Back Button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <BackButton
                variant="light"
                onClick={onRescan}
                label="Scan Ulang"
                position="inline"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold gradient-text-neon mb-2">
                Hasil Scan
              </h1>
              <p className="text-sm text-gray-600">
                Review informasi nutrisi di bawah ini
              </p>
            </div>
          </motion.div>

          {/* Health Grade Badge - 3D Style */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 0.3 }}
          >
            <GlassCard
              variant="medium"
              hover={false}
              className={`bg-gradient-to-br ${gradeConfig.bgGradient} p-8 mb-6 text-center ${gradeConfig.glow}`}
            >
              <motion.div
                className="text-6xl mb-3"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {gradeConfig.emoji}
              </motion.div>
              <div className="text-3xl font-bold text-gray-700 mb-2 drop-shadow-lg">
                Grade {result.healthGrade}
              </div>
              <div className="text-xl text-gray-700 drop-shadow-md">
                {gradeConfig.label}
              </div>
            </GlassCard>
          </motion.div>

          {/* Layman Explanation - Glassmorphism Speech Bubble */}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard
                variant="medium"
                hover={false}
                glow="blue"
                className="p-5 mb-6 relative"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    className="text-3xl flex-shrink-0"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🤓
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2 text-sm">
                      Penjelasan untuk Kamu:
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Nutrition Data - Animated Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard variant="light" hover={false} className="p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Informasi Nutrisi
              </h2>

              <div className="space-y-4">
                {/* Calories */}
                <NutritionBar
                  label="Kalori"
                  value={editedNutrition.calories}
                  max={500}
                  unit="kcal"
                  color="from-green-400 to-emerald-600"
                  delay={0.7}
                />

                {/* Protein */}
                <NutritionBar
                  label="Protein"
                  value={editedNutrition.protein}
                  max={50}
                  unit="g"
                  color="from-blue-400 to-cyan-600"
                  delay={0.8}
                />

                {/* Carbs */}
                {editedNutrition.carbs > 0 && (
                  <NutritionBar
                    label="Karbohidrat"
                    value={editedNutrition.carbs}
                    max={100}
                    unit="g"
                    color="from-amber-400 to-orange-600"
                    delay={0.9}
                  />
                )}

                {/* Fat */}
                {editedNutrition.fat > 0 && (
                  <NutritionBar
                    label="Lemak"
                    value={editedNutrition.fat}
                    max={50}
                    unit="g"
                    color="from-yellow-400 to-amber-600"
                    delay={1.0}
                  />
                )}

                {/* Sugar */}
                <NutritionBar
                  label="Gula"
                  value={editedNutrition.sugar}
                  max={50}
                  unit="g"
                  color="from-pink-400 to-rose-600"
                  delay={1.1}
                />

                {/* Sodium */}
                <NutritionBar
                  label="Natrium"
                  value={editedNutrition.sodium}
                  max={1000}
                  unit="mg"
                  color="from-purple-400 to-indigo-600"
                  delay={1.2}
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {/* Save button (primary) */}
            <AnimatedButton
              onClick={handleSaveClick}
              variant="neon"
              size="lg"
              glow={true}
              className="w-full"
            >
              💾 Simpan & Makan
            </AnimatedButton>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <AnimatedButton
                onClick={handleEditClick}
                variant="secondary"
                size="md"
                className="w-full"
              >
                ✏️ Edit
              </AnimatedButton>
              <AnimatedButton
                onClick={onRescan}
                variant="secondary"
                size="md"
                className="w-full"
              >
                🔄 Scan Ulang
              </AnimatedButton>
            </div>
          </motion.div>

          {/* Debug info (hidden in production) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-xs">
              <summary className="text-gray-500 cursor-pointer">Debug Info</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          )}
        </motion.div>
      </motion.div>

      {/* Input Modal for Save */}
      <InputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Simpan ke Riwayat"
        placeholder="Nama makanan/produk..."
        defaultValue="Produk Scan"
        confirmText="Simpan & Makan"
        cancelText="Batal"
      />

      {/* Nutrition Edit Modal */}
      <NutritionEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        initialData={editedNutrition}
      />
    </div>
  );
}

// Nutrition Bar Component
interface NutritionBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  delay: number;
}

function NutritionBar({ label, value, max, unit, color, delay }: NutritionBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-lg font-bold text-gray-800">
          {value} <span className="text-xs font-normal text-gray-600">{unit}</span>
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full shadow-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
