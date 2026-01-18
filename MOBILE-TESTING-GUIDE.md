# Mobile Testing Guide - Quick Reference

## 🧪 **Quick Test Steps**

### **1. Start Dev Server**
```bash
npm run dev
```
Visit: `http://localhost:3000`

---

### **2. Open Chrome DevTools**
1. Press `F12` or `Ctrl+Shift+I`
2. Click "Toggle Device Toolbar" (phone icon) or press `Ctrl+Shift+M`
3. Select device from dropdown

---

### **3. Test Device Profiles**

#### **iPhone SE (375x667)** - Smallest Common
```
Width: 375px
Height: 667px
DPR: 2x
```
**Test**: Text should be readable without zoom

#### **iPhone 12/13 (390x844)** - Modern Standard
```
Width: 390px
Height: 844px
DPR: 3x
```
**Test**: All buttons easily tappable

#### **iPhone 14 Pro Max (430x932)** - Largest
```
Width: 430px
Height: 932px
DPR: 3x
```
**Test**: Content should fill width nicely

#### **Samsung Galaxy S21 (360x800)** - Smallest Android
```
Width: 360px
Height: 800px
DPR: 3x
```
**Test**: Nothing should overflow horizontally

---

### **4. Page-by-Page Checklist**

#### **Home / Product Listing** (`/buy`)
- [ ] No horizontal scroll
- [ ] Product cards stack vertically (1 column on 360-430px)
- [ ] Filter button visible and tappable (min 44px)
- [ ] All product buttons min 44px height
- [ ] Images load correctly
- [ ] Text doesn't overflow cards

#### **Product Detail** (`/buy/[id]`)
- [ ] Image gallery fits screen width
- [ ] Product title readable (not too large)
- [ ] Price clearly visible
- [ ] Quantity buttons min 44x44px
- [ ] Add-to-cart button full width, min 48px height
- [ ] Accessories checkboxes easy to tap (24x24px)
- [ ] Installation option checkbox easy to tap
- [ ] No horizontal scroll

#### **Checkout** (`/checkout`)
- [ ] **CRITICAL**: Form inputs don't zoom on focus (16px+)
- [ ] All inputs min 48px height
- [ ] Single column layout
- [ ] Accordion sections easy to expand (60px headers)
- [ ] Radio buttons / checkboxes large enough
- [ ] Submit button sticky at bottom, 56px height
- [ ] Cart item images display correctly
- [ ] No overflow in any section

#### **Admin Panel** (`/administraciq`)
- [ ] Tables scroll horizontally (not page)
- [ ] Shadow indicators show scrollability
- [ ] All buttons min 44px
- [ ] Modals fill screen on mobile
- [ ] Inputs don't zoom (16px font)
- [ ] Tab navigation scrolls horizontally

#### **Footer & Cookie Banner**
- [ ] Footer sections stack vertically
- [ ] Social icons tappable
- [ ] Cookie banner buttons min 44px
- [ ] Banner doesn't block main CTAs
- [ ] Back-to-top button works

---

### **5. Interaction Tests**

#### **Tap Targets** (Use finger or stylus simulation)
```javascript
// Minimum sizes achieved:
- Buttons: 44-48px height
- Checkboxes: 24x24px
- Inputs: 48px height
- Primary CTAs: 52-56px height
```

#### **Form Inputs** (CRITICAL)
1. Tap any text input
2. **Expected**: No page zoom
3. **Actual font-size**: 16px (prevents iOS zoom)

#### **Scroll Behavior**
- [ ] Smooth scrolling works
- [ ] No bounce on horizontal (no overflow)
- [ ] Vertical scroll smooth
- [ ] Tables scroll independently (admin)

#### **Motion Reduction**
1. Enable "Reduce Motion" in device settings:
   - **iOS**: Settings → Accessibility → Motion → Reduce Motion
   - **Android**: Settings → Accessibility → Remove animations
2. **Expected**: No animations, instant transitions
3. **Actual**: All `prefers-reduced-motion` styles apply

---

### **6. Performance Check**

#### **Chrome DevTools Performance**
1. Open DevTools → Performance tab
2. Click Record
3. Scroll page, interact with elements
4. Stop recording
5. **Check**: 
   - FPS should stay ~60
   - No long tasks (>50ms)
   - No layout shifts (CLS)

#### **Lighthouse Mobile Audit**
```bash
# In DevTools → Lighthouse
- Select "Mobile"
- Run audit
- Check scores:
  - Performance: >80
  - Accessibility: >90
  - Best Practices: >80
```

---

### **7. Desktop Verification** ✅ CRITICAL

#### **Desktop Breakpoints to Test**
```
- 1024px (Small desktop)
- 1366px (Standard laptop)
- 1920px (Full HD)
- 2560px (4K)
```

#### **Desktop Checklist**
- [ ] Layout **IDENTICAL** to before changes
- [ ] No spacing differences
- [ ] No font size changes
- [ ] No color changes
- [ ] All hover effects work
- [ ] Desktop navigation unchanged

**If anything looks different on desktop, it's a BUG!**

---

### **8. Browser Compatibility**

#### **Mobile Browsers to Test**
- ✅ Safari iOS 15+ (iPhone)
- ✅ Chrome Android 90+
- ✅ Samsung Internet 15+
- ⚠️ Firefox Mobile (nice to have)

#### **Desktop Browsers to Verify**
- ✅ Chrome 100+
- ✅ Edge 100+
- ✅ Safari 15+ (macOS)
- ✅ Firefox 100+

---

### **9. Common Issues & Fixes**

#### **Issue**: Page zooms on input focus (iOS)
**Fix**: Ensure input font-size is ≥16px
```css
input, textarea, select {
  font-size: 16px !important;
}
```

#### **Issue**: Horizontal scroll appears
**Fix**: Check for fixed widths, use `max-width: 100%`
```css
* {
  max-width: 100%;
  overflow-wrap: break-word;
}
```

#### **Issue**: Buttons too small to tap
**Fix**: Set min-height
```css
button {
  min-height: 44px;
  min-width: 44px;
}
```

#### **Issue**: Text overflows on Bulgarian locale
**Fix**: Add word-break
```css
.text {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
```

---

### **10. Final Sign-Off**

**Before deploying to production:**

- [ ] All pages tested on real iPhone
- [ ] All pages tested on real Android device
- [ ] Desktop verified unchanged
- [ ] Checkout flow tested end-to-end
- [ ] Admin panel usable on mobile
- [ ] Build successful (`npm run build`)
- [ ] No console errors
- [ ] Lighthouse scores acceptable

---

## 📱 **Real Device Testing** (Recommended)

**Best practice**: Test on actual devices, not just emulators.

### **Borrow/Use**:
1. iPhone (any recent model)
2. Android phone (Samsung/Google Pixel)
3. iPad/tablet (for 768px breakpoint)

### **Network Testing**:
1. Test on 3G/4G (throttled)
2. Test on WiFi
3. Test offline behavior (PWA features)

---

## 🐛 **Report Issues**

If you find issues:
1. Note device & browser
2. Screenshot the problem
3. Describe expected vs actual behavior
4. Check if it's mobile-only or all breakpoints

---

## ✅ **Success Criteria**

**Mobile optimizations are successful when:**
- ✅ No horizontal scroll on any page
- ✅ All interactive elements easily tappable
- ✅ Forms usable without zoom
- ✅ Performance feels smooth (60fps)
- ✅ Desktop looks **EXACTLY** the same as before
- ✅ Checkout conversion rate improves
- ✅ Mobile bounce rate decreases

---

**Happy Testing! 🧪📱**
