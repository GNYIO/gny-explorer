import Vue from 'vue';
import ElementUI from 'element-ui';
// import 'element-theme-chalk';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en';

Vue.use(ElementUI, { locale });

Vue.filter('truncate', function (text, stop, clamp) {
    if (text === null || text === undefined || text === '') {
      return '';
    }
    return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
});

Vue.filter('ordinal', function(text) {
  const str = String(text);
  const lastChar = str[str.length - 1];
  
  if (text === 11) return '11th';
  if (text === 12) return '12th';
  if (text === 13) return '13th';

  if (str === '1') return `${text}st`
  if (str === '2') return `${text}nd`;
  if (str === '3') return `${text}rd`;
  
  if (lastChar === '1') return `${text}st`;
  if (lastChar === '2') return `${text}nd`;
  if (lastChar === '3') return `${text}rd`;

  return `${text}th`;
});