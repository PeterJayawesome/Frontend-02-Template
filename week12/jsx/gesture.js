
// listen => reconize => dispatch

// new Listener(new Recognizer(dispatch))
class Dispatcher {
    constructor(elem) {
        this.elem = elem;
    }
    dispatch(type, properties) {
        let event = new Event(type);
        for (let name in properties) {
            event[name] = properties[name];
        }
        this.elem.dispatchEvent(event);
    }

}

class Listener {
    constructor(elem, recognizer) {
        let { start, move, end, cancel } = recognizer;

        let contexts = new Map();

        let isListeningMouse = false;

        elem.addEventListener('mousedown', e => {

            let context = Object.create(null);
            let button = e.button;
            contexts.set('mouse' + (1 << button), context);

            start(e, context);

            const mouseMove = e => {
                let button = 1;
                while (button <= e.buttons) {

                    if (button & e.buttons) {
                        let key;
                        if (button === 2)
                            key = 4;
                        else if (button === 4) {
                            key = 2;
                        } else {
                            key = button
                        }
                        let context = contexts.get('mouse' + key);
                        move(e, context);
                    }
                    button = button << 1;
                }
                // let context = contexts.get('mouse' + (1 << button));
                // move(e, context);
            };
            const mouseUp = e => {
                let context = contexts.get('mouse' + (1 << e.button))
                end(e, context);
                contexts.delete('mouse' + (1 << e.button));

                if (e.buttons === 0) {
                    document.removeEventListener('mousemove', mouseMove);
                    document.removeEventListener('mouseup', mouseUp);
                    isListeningMouse = false;
                }
            }
            if (!isListeningMouse) {
                document.addEventListener('mousemove', mouseMove);
                document.addEventListener('mouseup', mouseUp);
                isListeningMouse = true;
            }
        });

        elem.addEventListener('touchstart', e => {
            for (let touch of e.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context);
                start(touch, context);
            }
        });

        elem.addEventListener('touchmove', e => {
            for (let touch of e.changedTouches) {
                let context = contexts.get(touch.identifier);
                move(touch, context);
            }
        });

        elem.addEventListener('touchend', e => {
            // console.log('touchend', e);
            for (let touch of e.changedTouches) {
                let context = contexts.get(touch.identifier);
                end(touch, context);
                contexts.delete(touch.identifier);
            }
        });

        elem.addEventListener('touchcancel', e => {
            for (let touch of e) {
                let context = contexts.get(touch.identifier);
                cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        });

    }
}

class Recognizer {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;

    }
    start = (point, context) => {
        // console.log('start');
        this.dispatcher.dispatch('start', {
            startX: point.clientX,
            startY: point.clientY,
            clientX: point.clientX,
            clientY: point.clientY,
        })
        context.startX = point.clientX, context.startY = point.clientY;

        context.points = [{
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        }];

        context.isTap = true, context.isPress = false, context.isPan = false;
        context.pressTimer = setTimeout(() => {
            context.isPress = true, context.isTap = false, context.isPan = false;
            context.pressTimer = null;
            this.dispatcher.dispatch('press', {});
        }, 500);

    }
    move = (point, context) => {
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
        if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
            context.isPan = true;
            context.isPress = false;
            context.isTap = false;
            context.isVertical = Math.abs(dx) < Math.abs(dy);
            clearTimeout(context.pressTimer);
            this.dispatcher.dispatch('panStart', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
            });
        }
        if (context.isPan) {
            context.isVertical = Math.abs(dx) < Math.abs(dy);
            this.dispatcher.dispatch('pan', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
            });
        }
        context.points = context.points.filter(point => Date.now() - point.t < 500);
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        });

    }
    end = (point, context) => {
        if (context.isTap) {
            this.dispatcher.dispatch('tap', {});
            clearTimeout(context.pressTimer);
        }
        if (context.isPress) {
            this.dispatcher.dispatch('pressEnd', {});
        }
        context.points = context.points.filter(point => Date.now() - point.t < 500);
        let v2;
        if (context.points.length) {
            let { x, y, t } = context.points[0];
            let dx = point.clientX - x, dy = point.clientY - y;
            v2 = (dx ** 2 + dy ** 2) / ((Date.now() - t) ** 2);
        } else {
            v2 = 0;
        }
        if (Math.sqrt(v2) > 1.5) {
            this.dispatcher.dispatch('flick', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: Math.sqrt(v2)

            })
            context.isFlick = true;
        } else {
            context.isFlick = false;
        }

        if (context.isPan) {
            this.dispatcher.dispatch('panEnd', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick
            });
        }
    }
    cancel = (point, context) => {
        this.dispatcher.dispatch('cancel', {});
        clearTimeout(context.pressTimer);
    }
}

export function enableGesture(element) {
    new Listener(element, new Recognizer(new Dispatcher(element)));
}

// enableGesture(document.documentElement);