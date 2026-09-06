import { AuthCard } from '@/components/auth-card/AuthCard'
import { ROUTES } from '@/constants/routes'
import { getApiErrorMessage } from '@/helpers/get-api-error'
import { useLoggedUser } from '@/hooks/use-logged-user'
import { useLoginMutation } from '@/store'
import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  Stack,
  TextInput,
} from '@mantine/core'
import { isEmail, isNotEmpty, useForm } from '@mantine/form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

interface LocationState {
  from?: { pathname?: string }
}

export default function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useLoggedUser()
  const [login, { isLoading }] = useLoginMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: isEmail(t('invalidEmail', { ns: 'validation' })),
      password: isNotEmpty(t('required', { ns: 'validation' })),
    },
  })

  if (isAuthenticated) {
    return <Navigate to={ROUTES.CATALOG} replace />
  }

  const handleSubmit = form.onSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values).unwrap()
      const redirectTo = (location.state as LocationState | null)?.from
        ?.pathname
      navigate(redirectTo ?? ROUTES.CATALOG, { replace: true })
    } catch (err) {
      setFormError(getApiErrorMessage(err, t('loginError')))
    }
  })

  return (
    <AuthCard
      title={t('logIn')}
      subtitle={t('loginSubtitle')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Anchor component={Link} to={ROUTES.REGISTER} c="blue">
            {t('register')}
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
            {t('submitLogin')}
          </Button>
        </Stack>
      </form>
    </AuthCard>
  )
}
