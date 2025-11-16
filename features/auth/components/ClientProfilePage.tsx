'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Mail, Calendar, LogOut, User as UserIcon, Camera, Loader2 } from 'lucide-react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ClientProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const t = useTranslations();
  const router = useRouter();
  const showToast = useWeatherStore((s) => s.showToast);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    setIsUploadingImage(true);
    try {
      // Ensure minimum overlay duration for sign-out
      const minDuration = 900;
      const until = Date.now() + minDuration;
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.setItem('authOverlayUntil', String(until));
        window.sessionStorage.setItem('authOverlayMode', 'signing-out');
      }
    } catch {
      // ignore storage errors
    }
    try {
      await signOut();
    } finally {
      // Redirect handled by Clerk; keep a transition screen meanwhile
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast({
        message: 'profile.invalidFileType',
        type: 'error',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        message: 'profile.fileTooLarge',
        type: 'error',
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      await user.setProfileImage({ file });
      showToast({
        message: 'profile.imageUpdated',
        type: 'success',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading image:', error);
      showToast({
        message: 'profile.imageUploadError',
        type: 'error',
      });
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImageConfirm = async () => {
    if (!user) return;

    setIsUploadingImage(true);

    try {
      await user.setProfileImage({ file: null });
      showToast({
        message: 'profile.imageRemoved',
        type: 'success',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing image:', error);
      showToast({
        message: 'profile.imageRemoveError',
        type: 'error',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen overflow-y-auto bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1117] dark:to-[#1b1f24]"
    >
      {/* Header with back button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="sticky top-0 z-50 bg-white/60 dark:bg-[#0d1117]/80 backdrop-blur-md shadow-sm border-b border-white/10"
      >
        <div className="p-4 flex items-center gap-3 w-full max-w-3xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-neutral-800 dark:text-white hover:bg-white/10"
            aria-label="חזור"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-neutral-800 dark:text-white/90">
            {t('navigation.profile')}
          </h1>
        </div>
      </motion.div>

      {/* Profile Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="px-4 py-6 pb-8 space-y-6 max-w-3xl mx-auto"
      >
        {isUploadingImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-3xl px-6">
              <div className="rounded-2xl border border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-6 w-full text-center">
                <Loader2 className="h-6 w-6 animate-spin text-sky-500 mx-auto mb-3" />
                <p className="text-sm text-neutral-700 dark:text-white/80">
                  {t('auth.signingOut')}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10 text-center flex flex-col items-center gap-4">
          {/* Profile Image */}
          <div className="relative group">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-28 h-28 rounded-full object-cover border-4 border-sky-500/20 dark:border-sky-400/20 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center border-4 border-sky-500/20 shadow-lg">
                <UserIcon className="h-14 w-14 text-white" />
              </div>
            )}
            
            {/* Upload overlay */}
            {isUploadingImage ? (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white rounded-full p-2.5 shadow-lg border-2 border-white dark:border-gray-900 transition-colors"
                aria-label={t('profile.changeImage')}
              >
                <Camera className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploadingImage}
            />
          </div>

          {/* User Name */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white/90">
              {user.fullName || user.username || 'User'}
            </h2>
            {user.primaryEmailAddress && (
              <p className="text-sm text-neutral-600 dark:text-white/60 mt-1">
                {user.primaryEmailAddress.emailAddress}
              </p>
            )}
          </div>

          {/* Remove Image Button - only show if user has image */}
          {user.imageUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isUploadingImage}
              className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              {t('profile.removeImage')}
            </Button>
          )}
        </Card>
        </motion.div>

        {/* Remove Image Confirmation Dialog */}
        <ConfirmDialog
          open={showRemoveDialog}
          onOpenChange={setShowRemoveDialog}
          onConfirm={handleRemoveImageConfirm}
          title={t('profile.removeImageTitle')}
          description={t('profile.confirmRemoveImage')}
          confirmText={t('profile.removeImage')}
          variant="danger"
          icon="trash"
        />

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
        <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10 space-y-3">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90 mb-3">
            {t('settings.accountDetails')}
          </h3>

          {/* Email */}
          {user.primaryEmailAddress && (
            <div className="flex items-center gap-3 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-white/10">
              <Mail className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 dark:text-white/60">{t('auth.email')}</p>
                <p className="text-sm text-neutral-800 dark:text-white/90 font-medium">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center gap-3 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-white/10">
            <Calendar className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            <div className="flex-1">
              <p className="text-xs text-neutral-600 dark:text-white/60">{t('profile.memberSince')}</p>
              <p className="text-sm text-neutral-800 dark:text-white/90 font-medium">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
        <Button
          onClick={handleSignOut}
          className="mt-8 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium h-12 gap-2 transition"
        >
          <LogOut className="h-5 w-5" />
          {t('auth.signOut')}
        </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

