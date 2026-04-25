declare module '#app' {
  interface NuxtApp {
    _sotweApiClient?: ReturnType<typeof $fetch.create>
  }
}

export {}
