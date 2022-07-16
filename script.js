// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
// for deep merging default_options

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function isAnimating(target, options) {
    return target.classList.contains(options.animation.prefix + 'playing') ? true : false
}

function fadeIn(target, options) {
    return new Promise(async resolve => {
        target.style.display = ''
        target.style.opacity = '0'
        target.style.transition = `${options.animation.speed}ms`
        setTimeout(() => {
            target.style.opacity = '1'
        }, 0)
        setTimeout(() => {
            target.style.opacity = ''
            target.style.transition = ''
            resolve()
        }, options.animation.speed)
    })
}
function fadeOut(target, options) {
    return new Promise(async resolve => {
        target.style.opacity = '1'
        target.style.transition = `${options.animation.speed}ms`
        setTimeout(() => {
            target.style.opacity = '0'
        }, 0)
        setTimeout(() => {
            target.style.opacity = ''
            target.style.transition = ''
            target.style.display = 'none'
            resolve()
        }, options.animation.speed)
    })
}
function fadeInOut(target, options) {
    return new Promise(async resolve => {
        if (target.style.display === 'none') {
            await fadeIn(target, options)
        }else {
            await fadeOut(target, options)
        }
        resolve()
    })
}

function classAnimationIn(target, options) {
    return new Promise(async resolve => {
        target.style.display = ''
        target.style.transitionDuration = `${options.animation.speed}ms`
        target.classList.add(options.animation.prefix + 'enter-from')
        setTimeout(() => {
            target.classList.remove(options.animation.prefix + 'enter-from')
            target.classList.add(options.animation.prefix + 'enter-active')
            target.classList.add(options.animation.prefix + 'enter-to')
        }, 0)
        setTimeout(() => {
            target.style.transitionDuration = ''
            target.classList.remove(options.animation.prefix + 'enter-active')
            target.classList.remove(options.animation.prefix + 'enter-to')
            resolve()
        }, options.animation.speed)
    })
}

function classAnimationOut(target, options) {
    return new Promise(async resolve => {
        target.style.transitionDuration = `${options.animation.speed}ms`
        target.classList.add(options.animation.prefix + 'leave-from')
        setTimeout(() => {
            target.classList.remove(options.animation.prefix + 'leave-from')
            target.classList.add(options.animation.prefix + 'leave-active')
            target.classList.add(options.animation.prefix + 'leave-to')
        }, 0)
        setTimeout(() => {
            target.style.display = 'none'
            target.style.transitionDuration = ''
            target.classList.remove(options.animation.prefix + 'leave-active')
            target.classList.remove(options.animation.prefix + 'leave-to')
            resolve()
        }, options.animation.speed)
    })
}

function classAnimation(target, options) {
    return new Promise(async resolve => {
        if (target.style.display === 'none') {
            await classAnimationIn(target, options)
        }else {
            await classAnimationOut(target, options)
        }
        resolve()
    })
}

function scrollAnimation(target, options) {
    let isScrolled = null;
    const scrollPercent = target.dataset.scrollPercent || .7
    const percentOf = target.dataset.percentOf || 'element'
    if (percentOf === 'window') {
        isScrolled = innerHeight + scrollY - innerHeight * scrollPercent >= target.offsetTop ? true: false
    }else {
        isScrolled = innerHeight + scrollY - target.clientHeight * scrollPercent >= target.offsetTop ? true: false
    }

    if (isScrolled) {
        target.classList.add(options.animation.prefix + 'shown')
    }else {
        target.classList.remove(options.animation.prefix + 'shown')
    }
}

const default_options = {
    prevent: true,
    parent: 'body',
    target_selector: '',
    animation: {
        speed: 300,
        prefix: 'animation-',
        prevent_overlap: true,
        function: fadeInOut,
        event: 'click',
        fire_on_init: false,
    }
}
class EventHandler {
    constructor(el, options = {}) {
        this.el = el
        this.el_arr = this.findEl(el)

        this.options = mergeDeep({}, default_options, options)

        this.onEvent = this.handleEvent.bind(this)

        this.init()
    }
    init() {
        this.el_arr.forEach(el => {
            el.addEventListener(this.options.animation.event, this.onEvent)
        })

        if (this.options.animation.fire_on_init) {
            this.getTarget(this.el).forEach(target => {
                this.options.animation.function.bind(this)(target, this.options)
            })
        }
    }
    destroy() {
        this.el_arr.forEach(el => {
            el.removeEventListener(this.options.animation.event, this.onEvent)
        })
    }
    handleEvent(e) {
        this.options.prevent ? e.preventDefault() : false
        const event_element = e.currentTarget || e.target
        const target_arr = this.getTarget(event_element)
        target_arr.forEach(async target => {
            if (this.options.animation.prevent_overlap) {
                if (isAnimating(target, this.options)) return console.warn('animation is already playing')
                target.classList.add(this.options.animation.prefix + 'playing')
            }

            await this.options.animation.function.bind(this)(target, this.options)

            if (this.options.animation.prevent_overlap) {
                target.classList.remove(this.options.animation.prefix + 'playing')
            }
        })
    }
    getTarget(el) {
        const target_selector = el.dataset?.target || this.options.target_selector
        if (target_selector === 'self') return [el]

        let parent
        if (this.options.parent === 'body') parent = document.body
        else parent = el.closest(this.options.parent) || document.body
        
        return [...parent.querySelectorAll(target_selector)]
    }
    findEl(el) {
        if (typeof el === 'string') {
            return [...document.querySelectorAll(el)]
        }else if (HTMLElement.prototype.isPrototypeOf(el) || el === window) {
            return [el]
        }else if (NodeList.prototype.isPrototypeOf(el)) {
            return [...el]
        }
        throw new Error('el is unknown type')
    }
}