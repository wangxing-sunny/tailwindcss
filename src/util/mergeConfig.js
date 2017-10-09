import _ from 'lodash'
import normalizeColorList from './normalizeColorList'
import findColor from './findColor'

const configTemplate = {
  breakpoints: null,
  colors: null,
  text: {
    fonts: null,
    sizes: null,
    weights: null,
    leading: null,
    tracking: null,
    colors: null,
  },
  backgrounds: {
    colors: null,
  },
  borders: {
    defaults: null,
    widths: null,
    rounded: {
      default: null,
      modifiers: null,
    },
    colors: null,
  },
  sizing: {
    width: null,
    height: null,
    minHeight: null,
    maxHeight: null,
    minWidth: null,
    maxWidth: null,
  },
  spacing: {
    padding: null,
    margin: null,
    negativeMargin: null,
  },
  shadows: null,
  zIndex: null,
  opacity: null,
}

function replaceDefaults(template, defaults, replacements) {
  return Object.keys(template).reduce((merged, key) => {
    const value = template[key]

    if (_.isPlainObject(value)) {
      merged[key] = replaceDefaults(value, _.get(defaults, key), _.get(replacements, key))
    } else {
      merged[key] = _.get(replacements, key, _.get(defaults, key))
    }

    return merged
  }, {})
}

function appendConfig(base, appends) {
  return _.mergeWith({}, base, appends, (baseValue, appendsValue) => {
    if (_.isArray(baseValue)) {
      return baseValue.concat(appendsValue);
    }
  })
}

function normalizeConfigColors(config, colorPalette) {
  const cloned = _.cloneDeep(config)

  cloned.text.colors = normalizeColorList(cloned.text.colors, colorPalette)
  cloned.borders.defaults.color = findColor(colorPalette, cloned.borders.defaults.color)
  cloned.borders.colors = normalizeColorList(cloned.borders.colors, colorPalette)
  cloned.backgrounds.colors = normalizeColorList(cloned.backgrounds.colors, colorPalette)

  return cloned
}

export default function mergeConfig(base, other) {
  const replaced = replaceDefaults(configTemplate, base, other)
  const config = appendConfig(replaced, _.get(other, 'extend', {}))
  return normalizeConfigColors(config, config.colors)
}