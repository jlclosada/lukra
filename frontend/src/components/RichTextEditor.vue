<script setup lang="ts">
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Inline popover state (replaces window.prompt which closes modals)
const showImageInput = ref(false)
const showLinkInput = ref(false)
const imageUrl = ref('')
const linkUrl = ref('')

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Escribe tu artículo aquí...' }),
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: true }),
    Highlight.configure({ multicolor: false }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val, { emitUpdate: false })
    }
  },
)

function addImage() {
  imageUrl.value = ''
  showImageInput.value = true
  showLinkInput.value = false
}

function confirmImage() {
  if (imageUrl.value && editor.value) {
    editor.value.chain().focus().setImage({ src: imageUrl.value }).run()
  }
  showImageInput.value = false
  imageUrl.value = ''
}

function addLink() {
  if (!editor.value) return
  linkUrl.value = editor.value.getAttributes('link').href || ''
  showLinkInput.value = true
  showImageInput.value = false
}

function confirmLink() {
  if (!editor.value) return
  if (linkUrl.value === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  }
  showLinkInput.value = false
  linkUrl.value = ''
}

function addImageFromFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file || !editor.value) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      editor.value!.chain().focus().setImage({ src }).run()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}
</script>

<template>
  <div class="rich-editor border rounded-sm overflow-hidden" :style="{ borderColor: 'var(--color-border)' }">
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
      :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }"
    >
      <!-- History -->
      <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" class="toolbar-btn" title="Deshacer"><Undo :size="15" /></button>
      <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" class="toolbar-btn" title="Rehacer"><Redo :size="15" /></button>

      <span class="toolbar-sep" />

      <!-- Text style -->
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ active: editor.isActive('heading', { level: 1 }) }" class="toolbar-btn" title="H1"><Heading1 :size="15" /></button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }" class="toolbar-btn" title="H2"><Heading2 :size="15" /></button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }" class="toolbar-btn" title="H3"><Heading3 :size="15" /></button>

      <span class="toolbar-sep" />

      <!-- Formatting -->
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }" class="toolbar-btn" title="Negrita"><Bold :size="15" /></button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }" class="toolbar-btn" title="Cursiva"><Italic :size="15" /></button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }" class="toolbar-btn" title="Subrayado"><UnderlineIcon :size="15" /></button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }" class="toolbar-btn" title="Tachado"><Strikethrough :size="15" /></button>
      <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ active: editor.isActive('highlight') }" class="toolbar-btn" title="Resaltado"><Highlighter :size="15" /></button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ active: editor.isActive('code') }" class="toolbar-btn" title="Código"><Code :size="15" /></button>

      <span class="toolbar-sep" />

      <!-- Alignment -->
      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ active: editor.isActive({ textAlign: 'left' }) }" class="toolbar-btn" title="Izquierda"><AlignLeft :size="15" /></button>
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ active: editor.isActive({ textAlign: 'center' }) }" class="toolbar-btn" title="Centro"><AlignCenter :size="15" /></button>
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ active: editor.isActive({ textAlign: 'right' }) }" class="toolbar-btn" title="Derecha"><AlignRight :size="15" /></button>
      <button @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ active: editor.isActive({ textAlign: 'justify' }) }" class="toolbar-btn" title="Justificado"><AlignJustify :size="15" /></button>

      <span class="toolbar-sep" />

      <!-- Lists & blocks -->
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }" class="toolbar-btn" title="Lista"><List :size="15" /></button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }" class="toolbar-btn" title="Lista numerada"><ListOrdered :size="15" /></button>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ active: editor.isActive('blockquote') }" class="toolbar-btn" title="Cita"><Quote :size="15" /></button>
      <button @click="editor.chain().focus().setHorizontalRule().run()" class="toolbar-btn" title="Línea horizontal"><Minus :size="15" /></button>

      <span class="toolbar-sep" />

      <!-- Media -->
      <button @click="addLink" :class="{ active: editor.isActive('link') }" class="toolbar-btn" title="Enlace"><LinkIcon :size="15" /></button>
      <button @click="addImage" class="toolbar-btn" title="Imagen URL"><ImageIcon :size="15" /></button>
      <button @click="addImageFromFile" class="toolbar-btn" title="Subir imagen">
        <span class="relative">
          <ImageIcon :size="15" />
          <span class="absolute -bottom-0.5 -right-1 text-[7px] font-bold" style="color: var(--color-accent-warm)">+</span>
        </span>
      </button>
    </div>

    <!-- Inline URL input for image -->
    <div v-if="showImageInput" class="flex items-center gap-2 border-b px-3 py-2" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }">
      <ImageIcon :size="14" style="color: var(--color-text-muted)" />
      <input
        v-model="imageUrl"
        type="url"
        placeholder="URL de la imagen..."
        class="flex-1 bg-transparent text-sm outline-none"
        autofocus
        @keydown.enter="confirmImage"
        @keydown.escape="showImageInput = false"
      />
      <button @click="confirmImage" class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer btn-primary rounded-sm">Insertar</button>
      <button @click="showImageInput = false" class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer btn-ghost rounded-sm">Cancelar</button>
    </div>

    <!-- Inline URL input for link -->
    <div v-if="showLinkInput" class="flex items-center gap-2 border-b px-3 py-2" :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }">
      <LinkIcon :size="14" style="color: var(--color-text-muted)" />
      <input
        v-model="linkUrl"
        type="url"
        placeholder="URL del enlace..."
        class="flex-1 bg-transparent text-sm outline-none"
        autofocus
        @keydown.enter="confirmLink"
        @keydown.escape="showLinkInput = false"
      />
      <button @click="confirmLink" class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer btn-primary rounded-sm">Aplicar</button>
      <button @click="showLinkInput = false" class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider cursor-pointer btn-ghost rounded-sm">Cancelar</button>
    </div>

    <!-- Editor content -->
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<style scoped>
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s;
}
.toolbar-btn:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text);
}
.toolbar-btn.active {
  background-color: var(--color-accent);
  color: var(--color-bg);
}
.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.toolbar-sep {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background-color: var(--color-border);
}

.editor-content {
  min-height: 400px;
  overflow-y: auto;
  background-color: var(--color-bg);
}

.editor-content :deep(.tiptap) {
  padding: 1.5rem 2rem;
  min-height: 400px;
  outline: none;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.9;
  color: var(--color-text);
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-muted);
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.tiptap h1) {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 300;
  margin: 1.5rem 0 0.75rem;
  line-height: 1.2;
}
.editor-content :deep(.tiptap h2) {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  margin: 1.25rem 0 0.5rem;
  line-height: 1.3;
}
.editor-content :deep(.tiptap h3) {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem;
  line-height: 1.4;
}

.editor-content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--color-accent-warm);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-text-secondary);
}

.editor-content :deep(.tiptap img) {
  max-width: 100%;
  height: auto;
  border-radius: 2px;
  margin: 1rem 0;
}

.editor-content :deep(.tiptap a) {
  color: var(--color-accent-warm);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.editor-content :deep(.tiptap mark) {
  background-color: #fef08a;
  padding: 0 2px;
  border-radius: 2px;
}

.editor-content :deep(.tiptap code) {
  background-color: var(--color-bg-subtle);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

.editor-content :deep(.tiptap hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2rem 0;
}
</style>
