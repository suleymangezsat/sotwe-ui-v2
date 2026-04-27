/*
 * Translates validation keys produced by `app/utils/validators.ts` into
 * the active-locale string via `useI18n()`. Keys live under `validation
 * .{field}.{rule}` in `i18n/locales/{en,tr,id}.json`.
 *
 * Form fields call this through their template:
 *   const errorMessage = computed(() => translateValidationKey(error.value))
 *
 * Returns `undefined` when the key is empty, so `<UFormField :error>`
 * stays unset for clean inputs. Missing keys fall through to vue-i18n's
 * default behaviour (returns the key itself), which is debuggable.
 */

export function translateValidationKey(key: string | undefined): string | undefined {
  if (!key) return undefined
  const { t } = useI18n()
  return t(key)
}
