<template>
  <UApp>
    <div class="min-h-screen">
      <UHeader title="Stagecom" to="/">
        <UContainer>
          <AppNav />
        </UContainer>
      </UHeader>

      <UContainer class="py-8">
        <slot />
      </UContainer>
    </div>
  </UApp>
</template>
