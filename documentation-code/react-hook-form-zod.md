# React Hook Form + Zod Validation Documentation

## Overview
This document provides comprehensive patterns for form validation in the **deKliK** platform using React Hook Form with Zod validation schemas. It covers form setup, validation patterns, error handling, and integration with our UI components.

## Current Implementation Patterns

### Configuration and Setup
```typescript
// lib/validations/defi.validations.ts
import { z } from 'zod'

export const createChallengeSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),
  amount: z
    .number()
    .min(10, 'Le montant minimum est de 10€')
    .max(500, 'Le montant maximum est de 500€'),
  dueDate: z
    .string()
    .min(1, 'La date d\'échéance est requise')
    .refine((date) => new Date(date) > new Date(), {
      message: 'La date d\'échéance doit être dans le futur',
    }),
  associationId: z
    .string()
    .min(1, 'Veuillez sélectionner une association'),
})

export type CreateChallengeFormData = z.infer<typeof createChallengeSchema>
```

### Basic Form Implementation
```typescript
// components/forms/CreateChallengeForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createChallengeSchema, type CreateChallengeFormData } from '@/lib/validations/defi.validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface CreateChallengeFormProps {
  associations: Association[]
  onSubmit: (data: CreateChallengeFormData) => Promise<void>
  isLoading?: boolean
}

export function CreateChallengeForm({ associations, onSubmit, isLoading }: CreateChallengeFormProps) {
  const form = useForm<CreateChallengeFormData>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 10,
      dueDate: '',
      associationId: '',
    },
  })

  const handleSubmit = async (data: CreateChallengeFormData) => {
    try {
      await onSubmit(data)
      form.reset() // Reset form on success
    } catch (error) {
      // Handle submission errors
      console.error('Form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du défi</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 30 jours sans sucre"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre défi en détail..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="10"
                  max="500"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'échéance</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="associationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Association bénéficiaire</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une association" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {associations.map((association) => (
                    <SelectItem key={association.id} value={association.id}>
                      {association.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Création en cours...' : 'Créer le défi'}
        </Button>
      </form>
    </Form>
  )
}
```

## Advanced Validation Patterns

### 1. **Complex Schema with Nested Validation**
```typescript
// lib/validations/user.validations.ts
export const updateProfileSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Adresse email invalide'),
    phone: z.string().optional(),
  }),
  preferences: z.object({
    notifications: z.boolean().default(true),
    publicProfile: z.boolean().default(false),
    language: z.enum(['fr', 'en']).default('fr'),
  }),
  challenges: z.object({
    maxActiveCount: z.number().min(1).max(10).default(3),
    defaultAmount: z.number().min(10).max(500).default(50),
  }),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
```

### 2. **Conditional Validation**
```typescript
// lib/validations/payment.validations.ts
export const paymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('card'),
    cardNumber: z.string().min(16, 'Numéro de carte invalide'),
    expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Format MM/YY requis'),
    cvv: z.string().min(3, 'CVV requis'),
    holderName: z.string().min(1, 'Nom du titulaire requis'),
  }),
  z.object({
    type: z.literal('paypal'),
    paypalEmail: z.string().email('Email PayPal invalide'),
  }),
  z.object({
    type: z.literal('bank_transfer'),
    iban: z.string().min(15, 'IBAN invalide'),
    bic: z.string().min(8, 'BIC invalide'),
  }),
])
```

### 3. **Custom Validation Functions**
```typescript
// lib/validations/custom.validations.ts
export const challengeUpdateSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  amount: z.number().min(10).max(500),
  dueDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const now = new Date()
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() + 1)
      
      return selectedDate > now && selectedDate < maxDate
    },
    {
      message: 'La date doit être entre aujourd\'hui et dans un an maximum',
    }
  ),
  associationId: z.string().uuid('ID d\'association invalide'),
}).refine(
  async (data) => {
    // Async validation: check if association exists
    const association = await getAssociationById(data.associationId)
    return association !== null
  },
  {
    message: 'Association introuvable',
    path: ['associationId'],
  }
)
```

## Error Handling Patterns

### 1. **Field-Level Error Display**
```typescript
// components/forms/fields/FormField.tsx
import { useFormContext } from 'react-hook-form'
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

interface FormFieldWrapperProps {
  name: string
  label: string
  children: React.ReactNode
  description?: string
}

export function FormFieldWrapper({ name, label, children, description }: FormFieldWrapperProps) {
  const { formState: { errors } } = useFormContext()
  const error = errors[name]

  return (
    <FormItem>
      <FormLabel className={error ? 'text-destructive' : undefined}>
        {label}
      </FormLabel>
      <FormControl>
        {children}
      </FormControl>
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <FormMessage />
    </FormItem>
  )
}
```

### 2. **Server Error Integration**
```typescript
// hooks/useFormSubmission.ts
import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface ServerError {
  field?: string
  message: string
  code?: string
}

interface UseFormSubmissionProps<T> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string; fieldErrors?: ServerError[] }>
}

export function useFormSubmission<T>({ form, onSubmit }: UseFormSubmissionProps<T>) {
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const handleSubmit = async (data: T) => {
    setIsLoading(true)
    setGlobalError(null)

    try {
      const result = await onSubmit(data)

      if (!result.success) {
        if (result.fieldErrors) {
          // Set field-specific errors
          result.fieldErrors.forEach((error) => {
            if (error.field) {
              form.setError(error.field as any, {
                type: 'server',
                message: error.message,
              })
            }
          })
        }

        if (result.error && !result.fieldErrors) {
          setGlobalError(result.error)
        }
      } else {
        // Success: reset form if needed
        form.reset()
      }
    } catch (error) {
      setGlobalError('Une erreur inattendue s\'est produite')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSubmit: form.handleSubmit(handleSubmit),
    isLoading,
    globalError,
    clearGlobalError: () => setGlobalError(null),
  }
}
```

### 3. **Error Display Component**
```typescript
// components/forms/ErrorDisplay.tsx
import { AlertCircle, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  variant?: 'destructive' | 'warning'
}

export function ErrorDisplay({ error, onDismiss, variant = 'destructive' }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <Alert variant={variant}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-0 text-current"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
```

## Form State Management

### 1. **Multi-Step Form Pattern**
```typescript
// components/forms/MultiStepForm.tsx
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface MultiStepFormProps<T> {
  schemas: z.ZodSchema<any>[]
  steps: React.ComponentType<any>[]
  onSubmit: (data: T) => Promise<void>
  defaultValues?: Partial<T>
}

export function MultiStepForm<T>({ schemas, steps, onSubmit, defaultValues }: MultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0)
  const isLastStep = currentStep === steps.length - 1

  const form = useForm<T>({
    resolver: zodResolver(schemas[currentStep]),
    defaultValues,
    mode: 'onChange',
  })

  const handleNext = async () => {
    const isValid = await form.trigger()
    if (isValid && !isLastStep) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: T) => {
    if (isLastStep) {
      await onSubmit(data)
    } else {
      handleNext()
    }
  }

  const CurrentStepComponent = steps[currentStep]

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CurrentStepComponent />
        
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Précédent
          </Button>
          
          <Button type="submit">
            {isLastStep ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
```

### 2. **Form Persistence Hook**
```typescript
// hooks/useFormPersistence.ts
import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface UseFormPersistenceProps<T> {
  form: UseFormReturn<T>
  key: string
  enabled?: boolean
}

export function useFormPersistence<T>({ form, key, enabled = true }: UseFormPersistenceProps<T>) {
  const storageKey = `form-${key}`

  // Load persisted data on mount
  useEffect(() => {
    if (!enabled) return

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved)
        form.reset(data)
      }
    } catch (error) {
      console.warn('Failed to load persisted form data:', error)
    }
  }, [form, storageKey, enabled])

  // Save form data on changes
  useEffect(() => {
    if (!enabled) return

    const subscription = form.watch((data) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        console.warn('Failed to persist form data:', error)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, storageKey, enabled])

  const clearPersistedData = () => {
    localStorage.removeItem(storageKey)
  }

  return { clearPersistedData }
}
```

## Integration with Server Actions

### 1. **Server Action Form Handler**
```typescript
// lib/actions/form-handlers.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createChallengeSchema } from '@/lib/validations/defi.validations'
import { createChallenge } from '@/lib/actions/defi.actions'
import { auth } from '@clerk/nextjs/server'

export async function createChallengeAction(formData: FormData) {
  try {
    // Parse form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      dueDate: formData.get('dueDate') as string,
      associationId: formData.get('associationId') as string,
    }

    // Validate with Zod
    const validatedData = createChallengeSchema.parse(rawData)

    // Get authenticated user
    const { userId } = await auth()
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Create challenge
    const result = await createChallenge({
      ...validatedData,
      userId,
    })

    if (result.success) {
      revalidatePath('/dashboard')
      redirect(`/challenges/${result.data.id}`)
    }

    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }
    }

    console.error('Form submission error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
```

### 2. **Client-Side Integration**
```typescript
// components/forms/CreateChallengeFormWrapper.tsx
'use client'

import { createChallengeAction } from '@/lib/actions/form-handlers'
import { CreateChallengeForm } from './CreateChallengeForm'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { ErrorDisplay } from './ErrorDisplay'

export function CreateChallengeFormWrapper({ associations }: { associations: Association[] }) {
  const form = useForm<CreateChallengeFormData>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 10,
      dueDate: '',
      associationId: '',
    },
  })

  const { handleSubmit, isLoading, globalError, clearGlobalError } = useFormSubmission({
    form,
    onSubmit: async (data) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
      
      return await createChallengeAction(formData)
    },
  })

  return (
    <div className="space-y-6">
      <ErrorDisplay error={globalError} onDismiss={clearGlobalError} />
      
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields... */}
        </form>
      </Form>
    </div>
  )
}
```

## Performance Optimization

### 1. **Optimized Re-renders**
```typescript
// components/forms/OptimizedFormField.tsx
import { memo } from 'react'
import { useController, Control } from 'react-hook-form'

interface OptimizedFormFieldProps {
  name: string
  control: Control<any>
  rules?: any
  render: (props: any) => React.ReactNode
}

export const OptimizedFormField = memo(function OptimizedFormField({
  name,
  control,
  rules,
  render,
}: OptimizedFormFieldProps) {
  const { field, fieldState } = useController({
    name,
    control,
    rules,
  })

  return render({ field, fieldState })
})
```

### 2. **Debounced Validation**
```typescript
// hooks/useDebouncedValidation.ts
import { useEffect, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { debounce } from 'lodash'

export function useDebouncedValidation<T>(
  form: UseFormReturn<T>,
  delay: number = 300
) {
  const debouncedTrigger = useCallback(
    debounce(async (fieldName?: string) => {
      await form.trigger(fieldName as any)
    }, delay),
    [form, delay]
  )

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name) {
        debouncedTrigger(name)
      }
    })

    return () => {
      subscription.unsubscribe()
      debouncedTrigger.cancel()
    }
  }, [form, debouncedTrigger])
}
```

## Testing Patterns

### 1. **Form Validation Tests**
```typescript
// __tests__/validations/defi.validations.test.ts
import { createChallengeSchema } from '@/lib/validations/defi.validations'

describe('createChallengeSchema', () => {
  const validData = {
    title: 'Test Challenge',
    description: 'This is a test challenge description that is long enough',
    amount: 50,
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    associationId: '123e4567-e89b-12d3-a456-426614174000',
  }

  it('should validate correct data', () => {
    const result = createChallengeSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const result = createChallengeSchema.safeParse({
      ...validData,
      title: '',
    })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('Le titre est requis')
  })

  it('should reject amount below minimum', () => {
    const result = createChallengeSchema.safeParse({
      ...validData,
      amount: 5,
    })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('Le montant minimum est de 10€')
  })

  it('should reject past due date', () => {
    const result = createChallengeSchema.safeParse({
      ...validData,
      dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    })
    expect(result.success).toBe(false)
    expect(result.error?.errors[0].message).toBe('La date d\'échéance doit être dans le futur')
  })
})
```

## Best Practices for deKliK

1. **Schema Organization** - Keep validation schemas in dedicated files by feature
2. **French Localization** - All error messages in French for user-facing forms
3. **Type Safety** - Use `z.infer<typeof schema>` for TypeScript types
4. **Error Handling** - Implement both field-level and global error handling
5. **Performance** - Use `mode: 'onChange'` only when necessary, prefer `'onBlur'` or `'onSubmit'`
6. **Accessibility** - Ensure proper ARIA attributes and error announcements
7. **Server Integration** - Validate on both client and server sides
8. **Form Persistence** - Save draft data for complex forms

## Common Patterns Summary

- **Basic Setup**: `useForm` + `zodResolver` + shadcn/ui components
- **Error Display**: Field-level with `FormMessage` + global with custom component
- **Server Actions**: Parse FormData + validate with Zod + handle errors
- **Multi-step Forms**: State management with schema switching
- **Performance**: Memoization + debounced validation for complex forms

This documentation provides a comprehensive foundation for implementing robust, user-friendly forms in the deKliK platform.