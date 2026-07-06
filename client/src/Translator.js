import { ref } from 'vue';

const lang = ref('DE');

const t = (en,de) => lang.value === 'EN' ? en : de;

export { t, lang };
export default t;
