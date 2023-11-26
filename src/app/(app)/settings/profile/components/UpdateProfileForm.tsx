import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import useMutation from 'swr/mutation';

import type { SupabaseClient } from '@supabase/supabase-js';

import configuration from '~/configuration';
import useUpdateProfileMutation from '~/lib/user/hooks/use-update-profile';

import Button from '~/core/ui/Button';
import TextField from '~/core/ui/TextField';
import ImageUploadInput from '~/core/ui/ImageUploadInput';

import Modal from '~/core/ui/Modal';
import useSupabase from '~/core/hooks/use-supabase';

import type UserSession from '~/core/session/types/user-session';
import type UserData from '~/core/session/types/user-data';
import AuthErrorMessage from '~/app/auth/components/AuthErrorMessage';

function UpdateProfileForm({
  session,
  onUpdateProfileData,
}: {
  session: UserSession;
  onUpdateProfileData: (user: Partial<UserData>) => void;
}) {
  const updateProfileMutation = useUpdateProfileMutation();

  const client = useSupabase();
  const currentPhotoURL = session.data?.photoUrl ?? '';
  const currentDisplayName = session?.data?.displayName ?? '';

  const user = session.auth?.user;
  const email = user?.email ?? '';

  const { register, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      displayName: currentDisplayName,
      photoURL: '',
    },
  });

  const onAvatarCleared = useCallback(() => {
    setValue('photoURL', '');
  }, [setValue]);

  const onSubmit = async (displayName: string, photoFile: Maybe<File>) => {
    const photoName = photoFile?.name;
    const existingPhotoRemoved = getValues('photoURL') !== photoName;

    let photoUrl = null;

    // if photo is changed, upload the new photo and get the new url
    if (photoName) {
      photoUrl = await uploadUserProfilePhoto(client, photoFile, user.id);
    }

    // if photo is not changed, use the current photo url
    if (!existingPhotoRemoved) {
      photoUrl = currentPhotoURL;
    }

    let shouldRemoveAvatar = false;

    // if photo is removed, set the photo url to null
    if (!photoUrl) {
      shouldRemoveAvatar = true;
    }

    if (photoFile && photoUrl && photoUrl !== currentPhotoURL) {
      shouldRemoveAvatar = true;
    }

    const info = {
      id: user.id,
      displayName,
      photoUrl,
    };

    // delete existing photo if different
    if (shouldRemoveAvatar && currentPhotoURL) {
      try {
        await deleteProfilePhoto(client, currentPhotoURL);
      } catch (e) {
        // old photo not found
      }
    }

    const promise = updateProfileMutation.trigger(info).then(() => {
      onUpdateProfileData(info);
    });

    return toast.promise(promise, {
      success: 'Profile successfully updated',
      error: `Encountered an error. Please try again`,
      loading: `Updating profile...`,
    });
  };

  const displayNameControl = register('displayName', {
    value: currentDisplayName,
  });

  const photoURLControl = register('photoURL');

  useEffect(() => {
    reset({
      displayName: currentDisplayName ?? '',
      photoURL: currentPhotoURL ?? '',
    });
  }, [currentDisplayName, currentPhotoURL, reset]);

  return (
    <>
      <form
        data-cy={'update-profile-form'}
        onSubmit={handleSubmit((value) => {
          return onSubmit(value.displayName, getPhotoFile(value.photoURL));
        })}
      >
        <div className={'flex flex-col space-y-4'}>
          <TextField>
            <TextField.Label>
              Display Name
              <TextField.Input
                {...displayNameControl}
                data-cy={'profile-display-name'}
                minLength={2}
                placeholder={''}
              />
            </TextField.Label>
          </TextField>

          <TextField>
            <TextField.Label>
              Profile Photo
              <ImageUploadInput
                {...photoURLControl}
                multiple={false}
                onClear={onAvatarCleared}
                image={currentPhotoURL}
              >
                Click here to upload an image
              </ImageUploadInput>
            </TextField.Label>
          </TextField>

          <TextField>
            <TextField.Label>
              Email
              <TextField.Input disabled value={email} />
            </TextField.Label>

            <div>
              <Button
                type={'button'}
                variant={'ghost'}
                size={'small'}
                href={configuration.paths.settings.email}
              >
                <span className={'text-xs font-normal'}>Update Email</span>
              </Button>
            </div>
          </TextField>

          <div>
            <Button
              className={'w-full md:w-auto'}
              loading={updateProfileMutation.isMutating}
            >
              Update Profile
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

/**
 * @name getPhotoFile
 * @param value
 * @description Returns the file of the photo when submitted
 * It returns undefined when the user hasn't selected a file
 */
function getPhotoFile(value: string | null | FileList) {
  if (!value || typeof value === 'string') {
    return;
  }

  return value.item(0) ?? undefined;
}

async function uploadUserProfilePhoto(
  client: SupabaseClient,
  photoFile: File,
  userId: string,
) {
  const bytes = await photoFile.arrayBuffer();
  const bucket = client.storage.from('avatars');
  const extension = photoFile.name.split('.').pop();
  const fileName = `${userId}.${extension}`;

  const result = await bucket.upload(fileName, bytes, {
    upsert: true,
  });

  if (!result.error) {
    return bucket.getPublicUrl(fileName).data.publicUrl;
  }

  throw result.error;
}

function deleteProfilePhoto(client: SupabaseClient, url: string) {
  const bucket = client.storage.from('avatars');
  const fileName = url.split('/').pop();

  if (!fileName) {
    return Promise.reject(new Error('Invalid file name'));
  }

  return bucket.remove([fileName]);
}

function RemovePhoneNumberButton({
  onSuccess,
}: React.PropsWithChildren<{
  onSuccess: () => void;
}>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const unlinkProfileNumberMutation = useUnlinkProfilePhone();

  const onUnlinkPhoneNumber = useCallback(() => {
    const promise = unlinkProfileNumberMutation.trigger().then(() => {
      setIsModalOpen(false);
      onSuccess();
    });

    return toast.promise(promise, {
      loading: `Unlinking account...`,
      success: `Account successfully unlinked`,
      error: `Sorry, we couldn't unlink this account`,
    });
  }, [unlinkProfileNumberMutation, onSuccess]);

  return (
    <>
      <Button
        type={'button'}
        variant={'ghost'}
        size={'small'}
        onClick={() => setIsModalOpen(true)}
      >
        <span className={'text-xs font-normal'}>Remove Phone Number</span>
      </Button>

      <Modal
        heading={`Remove Phone Number`}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      >
        <div className={'flex flex-col space-y-2.5 text-sm'}>
          <div>
            You&apos;re about to remove your phone number. You will not be able
            to use it to login to your account.
          </div>

          <div>Are you sure you want to continue?</div>

          <AuthErrorMessage error={unlinkProfileNumberMutation.error} />

          <div className={'flex justify-end space-x-2'}>
            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />

            <Button
              type={'button'}
              variant={'destructive'}
              loading={unlinkProfileNumberMutation.isMutating}
              onClick={onUnlinkPhoneNumber}
            >
              Yes, remove phone number
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function useUnlinkProfilePhone() {
  const client = useSupabase();
  const key = 'unlinkProfilePhone';

  return useMutation(key, async () => {
    return client.auth
      .updateUser({
        phone: undefined,
      })
      .then((response) => {
        if (response.error) {
          throw response.error;
        }

        return response.data;
      });
  });
}

export default UpdateProfileForm;
