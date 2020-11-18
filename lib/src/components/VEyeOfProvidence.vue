<script>
/**
 * Provides state for scoped <v-eye>, so they can work as group based on
 * provider conditions (props).
 */
export default {
  name: "VEyeOfProvidence",
  provide() {
    return {
      provider: this.$_provider,
    };
  },
  model: {
    prop: "modelValue",
    event: "input"
  },
  props: {
    /**
     * Currently open eye(s)
     */
    modelValue: {
      type: [String, Array, Number]
    },
    /**
     * At least one eye must be opem
     */
    mandatory: {
      type: Boolean,
      default: false
    },
    /**
     * 1+n eyes open at the same time
     */
    multiple: {
      type: Boolean,
      default: false
    },

    /**
     * Weather modelValue values should be reajusted when on of the config props
     * changes. Example: if we have multiple true and 2 items in model array,
     * if we change multiuple to false model value is updated to last-item in array
     * to become single (non-multiple) model, so consistent with proposition of "multiple"
     *
     * We also do that for empty states, so if change multiple
     * vuetify as an example doesn't perform any of this side-effects
     * till the user interacts with the component
     *
     * @see https://codepen.io/ohsimtabem/pen/zYBXWyo?editable=true&editors=101%3Dhttps%3A%2F%2Fvuetifyjs.com%2F
     */
    watchMultiple: {
      type: Boolean,
      default: true
    },

    /**
     * If mandatory starts at false and the is updated to true and modelValue
     * doesn't at least one item we make the first item open to ensure that
     */
    watchMandatory: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      state: {
        open: this.modelValue,
        injected: [],
        mandatory: this.mandatory,
        multiple: this.multiple
      }
    };
  },

  computed: {
    $_modelValueIsArray() {
      return Array.isArray(this.modelValue)
    },
    $_provider() {
      return {
        state: this.state,
        eyeTrack: this.eyeTrack,
        eyeIsOpen: this.eyeIsOpen,
        eyeToggle: this.eyeToggle,
      }
    }
  },

  watch: {
    modelValue: "syncActive", // keep in sync with exernal changes
    mandatory: "execMandatorySideEffects",
    multiple: "execMultipleSideEffects",
    "state.open": "syncModelValue" // mutated from inside, sync outside
  },

  created() {
    // watch.once at the beginning
    // test for withPropSide-effects here
    this.unwatchInjected = this.$watch("state.injected", injectedMembers => {
      if (this.mandatory && this.watchMandatory) {
        const first = injectedMembers[0];
        this.syncModelValue(this.multiple ? [first] : first);
      }
      /*else if (
        this.multiple &&
        this.watchMultiple &&
        this.state.open == null
      ) {
        this.syncModelValue([])
      }*/

      this.unwatchInjected();
    });

    if (this.multiple && !Array.isArray(this.modelValue)) {
      console.warn("when using multiple, modelValue/v-model must be an array");
    }

    if (this.mandatory && !this.modelValue) {
      console.warn("mandatory expects an initial modelValue");
    }
  },

  methods: {
    syncActive(modelValue) {
      this.state.open = modelValue;
    },
    syncModelValue(newVal) {
      this.state.open = newVal;
      this.$emit("input", newVal);
      this.$emit("update:modelValue", newVal);
    },
    execMandatorySideEffects(isMandatory) {
      this.state.mandatory = isMandatory;
      if (!this.watchMandatory) return;

      // should we do this?
      if (this.multiple && this.state.open && !this.state.open.length) {
        this.syncModelValue([this.state.injected[0]]);
      } else if (!this.state.open) {
        this.syncModelValue(this.state.injected[0]);
      }
    },
    execMultipleSideEffects(isMultiple) {
      this.state.multiple = isMultiple;

      if (!this.watchMultiple) return;

      if (isMultiple && this.state.open && !Array.isArray(this.state.open)) {
        this.syncModelValue([this.state.open]);
      } else if (isMultiple && !this.state.open) {
        this.syncModelValue([]);
      } else if (!isMultiple && Array.isArray(this.state.open)) {
        if (this.state.open.length === 0) {
          this.syncModelValue(null);
        } else {
          // should we do this ?
          this.syncModelValue(this.state.open[this.state.open.length - 1]);
        }
      }
    },

    // INJECTIONS API

    /**
     * Keep track of eyes created inside this provider instance
     * @param {String|Number} eyeId - each eye identifier
     */
    eyeTrack(eyeId) {
      if (!this.state.injected.includes(eyeId)) {
        this.state.injected.push(eyeId)
      }
    },
    /**
     * Check current injected eye open state
     * @param {String|Number} eyeId - each eye identifier
     * @return {Boolean}
     */
    eyeIsOpen(eyeId){
      if (this.$_modelValueIsArray) {
        return this.modelValue.find(el => el === eyeId);
      } else {
        return this.state.open === eyeId;
      }
    },
    /**
     * Toggleinjected eye open state depending on current provider "mode"
     * @param {String|Number} eyeId - each eye identifier
     */
    eyeToggle(eyeId) {
      const isOpen = this.eyeIsOpen(eyeId);

      if (this.multiple) {
        if (this.$_modelValueIsArray) {
          if (isOpen) {
            if (this.mandatory && this.modelValue.length === 1) {
              return;
            }

            this.state.open = this.modelValue.filter(
              el => el !== eyeId
            );
          } else {
            this.state.open.push(eyeId);
          }
        } else {
          this.state.open = isOpen ? null : [eyeId];
        }
      } else {
        this.state.open = this.mandatory
          ? eyeId
          : isOpen
          ? null
          : eyeId;
      }
    },
  },

  render() {
    // mostly because of jest, other wise would be regular slot
    return this.$scopedSlots.default({});
  }
};
</script>
