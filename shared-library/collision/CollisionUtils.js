// ============================================
// SHARED COLLISION UTILITIES
// ============================================
// Reusable collision detection functions
// Extracted after use in: Pong, Breakout, Space Invaders

const CollisionUtils = {
    /**
     * AABB (Axis-Aligned Bounding Box) collision detection
     * Checks if two rectangles overlap
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean} True if rectangles overlap
     */
    aabbCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * Check if a point is inside a rectangle
     * @param {number} x - Point X coordinate
     * @param {number} y - Point Y coordinate
     * @param {Object} rect - Rectangle {x, y, width, height}
     * @returns {boolean} True if point is inside rectangle
     */
    pointInRect(x, y, rect) {
        return x >= rect.x &&
               x <= rect.x + rect.width &&
               y >= rect.y &&
               y <= rect.y + rect.height;
    },
    
    /**
     * Circle collision detection
     * @param {Object} circle1 - First circle {x, y, radius}
     * @param {Object} circle2 - Second circle {x, y, radius}
     * @returns {boolean} True if circles overlap
     */
    circleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    },
    
    /**
     * Circle vs Rectangle collision (useful for ball vs paddle)
     * @param {Object} circle - Circle {x, y, radius}
     * @param {Object} rect - Rectangle {x, y, width, height}
     * @returns {boolean} True if circle overlaps rectangle
     */
    circleRectCollision(circle, rect) {
        // Find closest point on rectangle to circle center
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // Calculate distance from circle center to closest point
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distanceSquared = dx * dx + dy * dy;
        
        return distanceSquared < circle.radius * circle.radius;
    },
    
    /**
     * Get collision side (top, bottom, left, right)
     * Useful for determining which side of a rectangle was hit
     * @param {Object} moving - Moving object {x, y, width, height, dx, dy}
     * @param {Object} stationary - Stationary object {x, y, width, height}
     * @returns {string} 'top', 'bottom', 'left', or 'right'
     */
    getCollisionSide(moving, stationary) {
        const centerX = moving.x + moving.width / 2;
        const centerY = moving.y + moving.height / 2;
        const targetCenterX = stationary.x + stationary.width / 2;
        const targetCenterY = stationary.y + stationary.height / 2;
        
        const dx = centerX - targetCenterX;
        const dy = centerY - targetCenterY;
        
        // Determine if collision is more horizontal or vertical
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        
        if (absDx > absDy) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'bottom' : 'top';
        }
    },
    
    /**
     * Check if rectangle is completely inside another rectangle
     * @param {Object} inner - Inner rectangle {x, y, width, height}
     * @param {Object} outer - Outer rectangle {x, y, width, height}
     * @returns {boolean} True if inner is completely inside outer
     */
    rectContainsRect(inner, outer) {
        return inner.x >= outer.x &&
               inner.y >= outer.y &&
               inner.x + inner.width <= outer.x + outer.width &&
               inner.y + inner.height <= outer.y + outer.height;
    },
    
    /**
     * Get distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance between points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
};

// ============================================
// USAGE EXAMPLES (commented out)
// ============================================
/*
// AABB collision
const rect1 = {x: 10, y: 10, width: 50, height: 50};
const rect2 = {x: 40, y: 40, width: 50, height: 50};
if (CollisionUtils.aabbCollision(rect1, rect2)) {
    console.log('Rectangles colliding!');
}

// Point in rectangle
if (CollisionUtils.pointInRect(mouseX, mouseY, button)) {
    console.log('Clicked button!');
}

// Circle collision
const ball1 = {x: 100, y: 100, radius: 10};
const ball2 = {x: 105, y: 105, radius: 10};
if (CollisionUtils.circleCollision(ball1, ball2)) {
    console.log('Balls colliding!');
}

// Circle vs rectangle
const ball = {x: 200, y: 200, radius: 8};
const paddle = {x: 180, y: 300, width: 100, height: 15};
if (CollisionUtils.circleRectCollision(ball, paddle)) {
    console.log('Ball hit paddle!');
}
*/
