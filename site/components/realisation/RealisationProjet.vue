<script setup lang="ts">
import type { Img, Ligne } from '~/content/commun'

withDefaults(defineProps<{
  photo: Img
  nomProjet: string
  titreBalise?: 'h2' | 'h3'
  label?: string
  infos?: Ligne[]
  galerie?: Img[]
  lien?: { label: string; url: string }
}>(), { label: 'Fiche projet', titreBalise: 'h2', infos: () => [], galerie: () => [] })
const visionneuse = ref<HTMLDialogElement | null>(null)
const imageAgrandie = ref<Img | null>(null)
const descriptionImage = ref('')
let restaurerDefilement: (() => void) | undefined

async function agrandir(image: Img, description: string) {
  imageAgrandie.value = image
  descriptionImage.value = description
  await nextTick()
  if (!visionneuse.value || visionneuse.value.open) return
  const position = { left: window.scrollX, top: window.scrollY }
  visionneuse.value.showModal()
  const style = document.documentElement.style
  const overflow = style.getPropertyValue('overflow')
  const priorite = style.getPropertyPriority('overflow')
  style.setProperty('overflow', 'hidden')
  restaurerDefilement = () => {
    style.setProperty('overflow', overflow, priorite)
    window.scrollTo({ ...position, behavior: 'instant' })
  }
}
function restaurer() {
  restaurerDefilement?.()
  restaurerDefilement = undefined
}
function fermer() {
  visionneuse.value?.close()
  restaurer()
}
onBeforeUnmount(restaurer)
</script>

<template>
  <div class="projet">
    <div class="projet__principal" :class="{ 'projet__principal--lie': lien?.url }">
      <img v-reveal :src="img(photo, 1600)" :srcset="imgSrcset(photo, 2560)" sizes="(min-width: 1440px) 780px, (max-width: 640px) calc(100vw - 40px), (max-width: 1024px) calc(100vw - 80px), (max-width: 1200px) calc(100vw - 160px), calc((100vw - 192px) * 5 / 8)" loading="eager" :alt="alt(photo) || nomProjet" class="projet__photo" />
      <div v-reveal="120" class="fiche">
        <p class="label-mono fiche__label">{{ label }}</p>
        <component :is="titreBalise" class="display-h3 fiche__titre">{{ nomProjet }}</component>
        <dl v-if="infos?.length" class="fiche__infos">
          <div v-for="info in infos" :key="info.label" class="fiche__info">
            <dt class="label-mono">{{ info.label }}</dt>
            <dd>{{ info.valeur }}</dd>
          </div>
        </dl>
        <UiLink
          v-if="lien?.url"
          class="fiche__lien"
          :label="lien.label"
          :to="lien.url"
          :aria-label="`${lien.label} : ${nomProjet}`"
        />
      </div>
    </div>

    <ul v-if="galerie?.length" class="projet__galerie" aria-label="Photos de la réalisation">
      <li v-for="(image, i) in galerie.slice(0, 4)" :key="i" v-reveal="i * 90">
        <button type="button" class="projet__agrandir" :aria-label="`Agrandir la photo ${i + 1} : ${nomProjet}`" @click="agrandir(image, alt(image) || `${nomProjet} — vue ${i + 1}`)">
        <img :src="img(image, 700)" :srcset="imgSrcset(image, 1200)" sizes="(min-width: 1440px) 296px, (max-width: 640px) calc((100vw - 56px) / 2), (max-width: 1024px) calc((100vw - 112px) / 2), calc((100vw - 256px) / 4)" :alt="alt(image) || `${nomProjet} — vue ${i + 1}`" loading="lazy" />
        </button>
      </li>
    </ul>
    <dialog ref="visionneuse" class="visionneuse" aria-label="Photo de la réalisation en grand" @close="restaurer" @click.self="fermer">
      <button type="button" class="visionneuse__fermer" aria-label="Fermer la photo" autofocus @click="fermer">×</button>
      <img v-if="imageAgrandie" :src="img(imageAgrandie, 2560)" :alt="descriptionImage" class="visionneuse__image" />
    </dialog>
  </div>
</template>

<style scoped>
.projet {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.projet__principal {
  position: relative;
  display: flex;
  gap: 32px;
}

.projet__photo {
  width: calc((100% - 32px) * 5 / 8);
  height: 560px;
  flex: none;
  border-radius: 20px;
  object-fit: cover;
}

.fiche {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 40px;
  border-radius: 20px;
  background: var(--cream);
}

.fiche__titre {
  overflow-wrap: anywhere;
}

.fiche__label {
  color: var(--orange-700);
}

.fiche__infos {
  width: 100%;
  margin: 0;
}

.fiche__info {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.fiche__info dt {
  color: var(--brown-500);
}

.fiche__info dd {
  margin: 0;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.fiche__lien::after {
  position: absolute;
  inset: 0;
  content: '';
}

.projet__principal--lie:focus-within {
  border-radius: 20px;
  outline: 3px solid var(--orange-700);
  outline-offset: 4px;
}

.projet__galerie {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.projet__agrandir { display:block; width:100%; padding:0; border:0; border-radius:12px; background:transparent; cursor:zoom-in; }
.projet__agrandir:focus-visible { outline:3px solid var(--orange-500); outline-offset:4px; }
.visionneuse { position:fixed; inset:0; width:100%; max-width:none; height:100%; max-height:none; margin:0; padding:64px 20px 24px; border:0; background:rgba(23,15,13,.94); }
.visionneuse[open] { display:grid; place-items:center; }
.visionneuse__image { max-width:100%; max-height:calc(100dvh - 88px); width:auto; height:auto; object-fit:contain; border-radius:8px; }
.visionneuse__fermer { position:absolute; top:12px; right:16px; width:44px; height:44px; border:0; border-radius:50%; background:var(--paper); color:var(--brown-900); font-size:32px; cursor:pointer; }

.projet__galerie img {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
}

@media (max-width: 1200px) {
  .projet__principal { flex-direction: column; }
  .projet__photo { width: 100%; height: 420px; }
}

@media (max-width: 1024px) {
  .projet__galerie { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .projet { gap: 32px; }
  .projet__photo { height: auto; aspect-ratio: 4 / 3; }
  .fiche { padding: 28px 24px; }
  .fiche__info { grid-template-columns: 1fr; gap: 8px; }
  .projet__galerie { gap: 16px; }
  .projet__galerie img { height: auto; aspect-ratio: 4 / 3; }
}
</style>
