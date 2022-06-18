import { sleep } from '~/utils'

// track uid to avoid scrolling on when back and forth is spammed;
let uid = 0

export default function(to, from, saved) {
    if (to.path === from.path) {
        return {}
    }

    const top = saved ? saved.y || 0 : 0

    const left = saved ? saved.x || 0 : 0

    const splitFrom = ((from || {}).path || '').split('/').filter(Boolean)
    const splitTo = to.path.split('/').filter(Boolean)

    // only use smooth scroll for specific routing
    // from /auth/* to /auth/*
    const behavior =
        splitFrom[0] === 'auth' && splitTo[0] === 'auth' ? 'smooth' : 'auto'

    uid += 1
        // track uid to avoid scrolling on when back and forth is spammed;
    const _uid = uid

    sleep(
        // Dont change this without changing the .page-transition-*-leave-active duration in /assets/css/utilities.css
        100
    ).then(() => {
        if (_uid === uid) {
            window.scrollTo({
                behavior,
                left,
                top,
            })
        }
    })
}