import { AuthCard } from '@/components/auth-card/AuthCard'
import { ROUTES } from '@/constants/routes'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { useRegisterMutation } from '@/store'
import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  SimpleGrid,
  Stack,
  TextInput,
} from '@mantine/core'
import { hasLength, isEmail, isNotEmpty, useForm } from '@mantine/form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'

const PASSWORD_MIN_LENGTH = 8

export default function RegisterPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { isAuthenticated } = useLoggedUser()
  const [register, { isLoading }] = useRegisterMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { firstName: '', lastName: '', email: '', password: '' },
    validate: {
      firstName: isNotEmpty(t('required', { ns: 'validation' })),
      lastName: isNotEmpty(t('required', { ns: 'validation' })),
      email: isEmail(t('invalidEmail', { ns: 'validation' })),
      password: hasLength(
        { min: PASSWORD_MIN_LENGTH },
        t('minLength', { ns: 'validation', count: PASSWORD_MIN_LENGTH }),
      ),
    },
  })

  if (isAuthenticated) {
    return <Navigate to={ROUTES.CATALOG} replace />
  }

  const handleSubmit = form.onSubmit(async (values) => {
    setFormError(null)
    try {
      await register(values).unwrap()
      navigate(ROUTES.CATALOG, { replace: true })
    } catch (err) {
      const isConflict =
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        err.status === 409
      setFormError(
        isConflict
          ? t('emailInUse')
          : getApiErrorMessage(err, t('registerError')),
      )
    }
  })

  return (
    <AuthCard
      title={t('register')}
      subtitle={t('registerSubtitle')}
      footer={
        <>
          {t('haveAccount')}{' '}
          <Anchor component={Link} to={ROUTES.LOGIN}>
            {t('logIn')}
          </Anchor>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {formError && (
            <Alert color="red" title={t('errorTitle', { ns: 'common' })}>
              {formError}
            </Alert>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label={t('firstName')}
              withAsterisk
              key={form.key('firstName')}
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label={t('lastName')}
              withAsterisk
              key={form.key('lastName')}
              {...form.getInputProps('lastName')}
            />
          </SimpleGrid>

          <TextInput
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            type="email"
            withAsterisk
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label={t('password')}
            withAsterisk
            key={form.key('password')}
            {...form.getInputProps('password')}
          />

          <Button type="submit" fullWidth mt="sm" loading={isLoading}>
            {t('submitRegister')}
          </Button>
        </Stack>
      </form>
    </AuthCard>
  )
}
