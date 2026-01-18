import { supabase } from './client';

/**
 * Upload food image to Supabase Storage
 * @param userId - User ID for folder organization
 * @param file - Image file to upload
 * @returns Public URL of uploaded image or null on error
 */
export async function uploadFoodImage(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Food image upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('food-images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return null;
  }
}

/**
 * Upload user avatar to Supabase Storage
 * @param userId - User ID for folder organization
 * @param file - Avatar image file
 * @returns Public URL of uploaded avatar or null on error
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    // Upsert to replace existing avatar
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Replace existing avatar
      });
    
    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected avatar upload error:', error);
    return null;
  }
}

/**
 * Delete image from storage
 * @param bucket - Storage bucket name
 * @param path - File path in storage
 */
export async function deleteImage(
  bucket: 'food-images' | 'avatars' | 'product-labels',
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return false;
  }
}
