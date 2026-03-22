<script lang="ts" setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
</script>

<template>

  <!-- 👉 Apps & Pages -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'Apps & Pages',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Login',
      icon: 'bx-log-in',
      to: '/login',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Register',
      icon: 'bx-user-plus',
      to: '/register',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Meus animais',
      icon: 'bx-gitlab',
      to: '/animals',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Monitoramento',
      icon: 'bx-water',
      to: '/monitoring',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Cadastrar pote',
      icon: 'bx-plus-circle',
      to: '/bowls-create',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Cadastrar logs (em massa)',
      icon: 'bx-list-plus',
      to: '/logs-bulk',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Consumo de ração',
      icon: 'bx-bowl-hot',
      to: '/food-log-create',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Diário do animal',
      icon: 'bx-note',
      to: '/animal-diary',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Exames',
      icon: 'bx-file',
      to: '/exames',
    }"
  />


</template>
