import { mount } from "@vue/test-utils";
import { VEyeOfProvidence, VEye } from "@/components";
import EyeSlotMock from "./__mocks__/EyeSlotMock.vue";

describe("VEyeOfProvidence.vue", () => {
  const wrapper = mount(VEyeOfProvidence, {
    propsData: { 
      modelValue: null 
    },
    scopedSlots: {
      default() {
        const h = this.$createElement
        return h(
          'div', 
          { attrs: { id: 'mock-group' } }, 
          ['one', 'two'].map(i => {
            return h(VEye, {
              props: {
                uid: i
              },
              scopedSlots: {
                default({ isOpen, toggle }) {
                  return h(EyeSlotMock, { 
                    props: { isOpen }, 
                    attrs: { id: i },
                    on: { 'mock-click': toggle }
                  })
                }
              }
            })
          })
        )
      } 
    }
  });

  it("placeholder", () => {
    console.log(wrapper.html())
    expect(wrapper.exists()).toBe(true);
  })
})
