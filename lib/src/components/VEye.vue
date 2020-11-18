<script>
/**
 * Opens and closes, revealing its content.
 */
export default {
  name: "VEye",
  inject: {
    provider: {
      default: {}
    }
  },
  model: {
    prop: "open",
    event: "toggle"
  },
  props: {
    /**
     * when used inside a pack, you better use this
     * to know who is who in the v-model, otherwise
     * you'll get vue's uid
     */
    uid: {
      type: [String, Number]
    },
    /**
     * initial value, when used outside a pack
     */
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalOpen: this.open
    };
  },

  computed: {
    $_uid() {
      return this.uid === null || this.uid === undefined
        ? `v-eye-${this._uid}` // use Vue's componennt uid to avoid including a generator
        : this.uid;
    },
    $_independent() {
      return JSON.stringify(this.provider) === "{}";
    },
    $_open() {
      if (this.$_independent) {
        return this.internalOpen;
      }

      return this.provider.eyeIsOpen(this.$_uid)
    },
  },

  watch: {
    open(isOpen) {
      this.internalOpen = isOpen;
    }
  },

  created() {
    if (!this.$_independent) {
      this.provider.eyeTrack(this.$_uid)
    }

    if (!this.$_independent && this.open !== false) {
      console.log("this eye can't control himself, it's under eye-of-providence control");
    }
  },

  methods: {
    toggle() {
      if (this.$_independent) {
        this.internalOpen = !this.internalOpen;
        this.$emit("toggle", this.internalOpen);
        this.$emit("update:open", this.internalOpen);
        return;
      }

      this.provider.eyeToggle(this.$_uid)
    }
  },

  render() {
    return this.$scopedSlots.default({
      isOpen: this.$_open,
      toggle: this.toggle
    })
  }
};
</script>