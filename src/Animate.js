/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 *
 * Based on the work of: Unify Project (unify-project.org)
 * http://unify-project.org
 * Copyright 2011, Deutsche Telekom AG
 * License: MIT + Apache (V2)
 */

/**
 * Generic animation class with support for dropped frames both optional easing and duration.
 *
 * Optional duration is useful when the lifetime is defined by another condition than time
 * e.g. speed of an animating object, etc.
 *
 * Dropped frame logic allows to keep using the same updater logic independent from the actual
 * rendering. This eases a lot of cases where it might be pretty complex to break down a state
 * based on the pure time difference.
 */

const time = Date.now || function time() {
  return +new Date();
};
const desiredFrames = 60;
const millisecondsPerSecond = 1000;
let running = {};
let counter = 1;

const Animate = {

  /**
   * A requestAnimationFrame wrapper / polyfill.
   *
   * @param callback {Function} The callback to be invoked before the next repaint.
   * @param root {HTMLElement} The root element for the repaint
   */
  requestAnimationFrame: ((() => {
    // Check for request animation Frame support
    const requestFrame = global.requestAnimationFrame ||
      global.webkitRequestAnimationFrame ||
      global.mozRequestAnimationFrame ||
      global.oRequestAnimationFrame;
    let isNative = !!requestFrame;

    if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
      isNative = false;
    }

    if (isNative) {
      return (callback, root) => {
        requestFrame(callback, root);
      };
    }

    const TARGET_FPS = 60;
    let requests = {};
    let rafHandle = 1;
    let intervalHandle = null;
    let lastActive = +new Date();

    return (callback) => {
      const callbackHandle = rafHandle;
      rafHandle += 1;

      // Store callback
      requests[callbackHandle] = callback;

      // Create timeout at first request
      if (intervalHandle === null) {
        intervalHandle = setInterval(() => {
          const start = time();
          const currentRequests = requests;

          // Reset data structure before executing callbacks
          requests = {};

          Object.keys(currentRequests).forEach((key) => {
            currentRequests[key](start);
            lastActive = start;
          });

          // Disable the timeout when nothing happens for a certain
          // period of time
          if (start - lastActive > 2500) {
            clearInterval(intervalHandle);
            intervalHandle = null;
          }
        }, 1000 / TARGET_FPS);
      }

      return callbackHandle;
    };
  })()),


  /**
   * Stops the given animation.
   *
   * @param id {Integer} Unique animation ID
   * @return {Boolean} Whether the animation was stopped (aka, was running before)
   */
  stop: (id) => {
    const cleared = running[id] != null;
    if (cleared) {
      running[id] = null;
    }

    return cleared;
  },


  /**
   * Whether the given animation is still running.
   *
   * @param id {Integer} Unique animation ID
   * @return {Boolean} Whether the animation is still running
   */
  isRunning: id => running[id] != null,


  /**
   * Start the animation.
   *
   * @param stepCallback {Function} Pointer to function which is executed on every step.
   *   Signature of the method should be
   * `function(percent, now, virtual) { return continueWithAnimation; }`
   * @param verifyCallback {Function} Executed before every animation step.
   *   Signature of the method should be `function() { return continueWithAnimation; }`
   * @param completedCallback {Function}
   *   Signature of the method should be `function(droppedFrames, finishedAnimation) {}`
   * @param duration {Integer} Milliseconds to run the animation
   * @param easingMethod {Function} Pointer to easing function
   *   Signature of the method should be `function(percent) { return modifiedValue; }`
   * @param root {Element ? document.body} Render root, when available. Used for internal
   *   usage of requestAnimationFrame.
   * @return {Integer} Identifier of animation. Can be used to stop it any time.
   */
  start: (stepCallback, verifyCallback, completedCallback, duration, easingMethod, r) => {
    let root = r;
    const start = time();
    let lastFrame = start;
    let percent = 0;
    let dropCounter = 0;
    counter += 1;
    const id = counter;

    if (!root) {
      root = document.body;
    }

    // Compacting running db automatically every few new animations
    if (id % 20 === 0) {
      const newRunning = {};
      Object.keys(running).forEach((usedId) => {
        newRunning[usedId] = true;
      });
      running = newRunning;
    }

    // This is the internal step method which is called every few milliseconds
    const step = function step(virtual) {
      // Normalize virtual value
      const render = virtual !== true;

      // Get current time
      const now = time();

      // Verification is executed before next animation step
      if (!running[id] || (verifyCallback && !verifyCallback(id))) {
        running[id] = null;
        if (completedCallback) {
          completedCallback(
            desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)),
            id,
            false,
          );
        }
        return;
      }

      // For the current rendering to apply let's update omitted steps in memory.
      // This is important to bring internal state variables up-to-date with progress in time.
      if (render) {
        const droppedFrames =
          Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
        for (let j = 0; j < Math.min(droppedFrames, 4); j += 1) {
          step(true);
          dropCounter += 1;
        }
      }

      // Compute percent value
      if (duration) {
        percent = (now - start) / duration;
        if (percent > 1) {
          percent = 1;
        }
      }

      // Execute step callback, then...
      const value = easingMethod ? easingMethod(percent) : percent;
      if ((stepCallback(value, now, render) === false || percent === 1) && render) {
        running[id] = null;
        if (completedCallback) {
          completedCallback(
            desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)),
            id,
            percent === 1 || duration == null,
          );
        }
      } else if (render) {
        lastFrame = now;
        Animate.requestAnimationFrame(step, root);
      }
    };

    // Mark as running
    running[id] = true;

    // Init first step
    Animate.requestAnimationFrame(step, root);

    // Return unique animation ID
    return id;
  },
};

export default Animate;
