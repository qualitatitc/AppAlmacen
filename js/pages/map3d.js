console.log("CRITICAL: map3d.js is parsing...");

(function() {
  var WMS = window.WMS || {};

  var scene, camera, renderer, controls, animationId;
  var containerEl;

  console.log("Map3D IIFE executing...");

  window.WMS = window.WMS || {};
  window.WMS.renderMap3D = async function(container) {
    console.log("WMS.renderMap3D called with container:", container);
    if (typeof THREE === 'undefined') {
      container.innerHTML = '<div class="card"><div class="card-body text-center"><h3 class="text-danger">Error: Librerías 3D no cargadas</h3><p>Recarga la página para intentarlo de nuevo.</p></div></div>';
      return;
    }
    await init3D(container);
  };

  async function init3D(el) {
    try {
      console.log("3D Check: Starting init3D");
      containerEl = el;
      el.innerHTML = '<div style="position:relative;width:100%;height:calc(100vh - var(--topbar-height));overflow:hidden;">' +
        '<div id="map3d-canvas" style="width:100%;height:100%;"></div>' +
        '<div style="position:absolute;top:var(--space-4);left:var(--space-4);z-index:10;pointer-events:none;">' +
          '<h2 style="margin:0;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.5)">🗺️ MAPA 3D</h2>' +
          '<p style="color:var(--text-secondary);text-shadow:0 1px 2px rgba(0,0,0,0.5);margin-top:var(--space-1)">Estructura y Ocupación</p>' +
        '</div>' +
        '<div style="position:absolute;bottom:var(--space-4);right:var(--space-4);z-index:10;background:rgba(11,14,20,0.8);backdrop-filter:blur(8px);padding:var(--space-3);border-radius:var(--radius-lg);border:1px solid rgba(255,255,255,0.05);color:#fff">' +
          '<h4 style="margin-bottom:var(--space-2);font-size:var(--font-sm)">Leyenda</h4>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);margin-bottom:var(--space-1)"><span style="display:inline-block;width:12px;height:12px;background:#ef4444;border-radius:2px"></span> Ocupado</div>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);margin-bottom:var(--space-1)"><span style="display:inline-block;width:12px;height:12px;background:#3b82f6;border-radius:2px"></span> Stock Bajo</div>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);margin-bottom:var(--space-1)"><span style="display:inline-block;width:12px;height:12px;background:#ffeb3b;border-radius:2px"></span> Buscado</div>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs)"><span style="display:inline-block;width:12px;height:12px;background:#4a5568;border-radius:2px"></span> Vacío</div>' +
          '<button class="btn btn-secondary" style="margin-top:var(--space-3);width:100%;padding:var(--space-1);font-size:var(--font-xs)" id="resetCameraBtn">Centrar Cámara</button>' +
        '</div>' +
        '<div id="tooltip3d" style="position:absolute;display:none;background:rgba(0,0,0,0.9);color:#fff;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:20;border:1px solid var(--border-color);box-shadow:var(--shadow-lg);transform:translate(-50%, -100%);margin-top:-10px"></div>' +
      '</div>';

      var canvasWrapper = document.getElementById('map3d-canvas');
      var rect = canvasWrapper.getBoundingClientRect();
      var width = rect.width || canvasWrapper.clientWidth || 800;
      var height = rect.height || canvasWrapper.clientHeight || 600;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b0e14);
      
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(20, 30, 40);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.domElement.id = "three-canvas";
      canvasWrapper.appendChild(renderer.domElement);

      if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
      }

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(20, 40, 20);
      scene.add(dirLight);
      scene.add(new THREE.GridHelper(100, 50, 0x333333, 0x1a202c));

      await buildShelves();
      animate();

      window.addEventListener('resize', onWindowResize);
      var rBtn = document.getElementById('resetCameraBtn');
      if (rBtn) rBtn.addEventListener('click', resetCamera);
      setupRaycaster(canvasWrapper, camera, scene);
      
      console.log("3D Check: Init finished successfully");
    } catch (err) {
      console.error("3D Error in init3D:", err);
      el.innerHTML = '<div class="card"><div class="card-body"><h3 class="text-danger">Error de inicialización 3D</h3><p>' + err.message + '</p></div></div>';
    }
  }

  function resetCamera() {
    camera.position.set(20, 30, 40);
    camera.lookAt(0, 0, 0);
    if (controls) controls.target.set(0,0,0);
  }

  function onWindowResize() {
    if (!containerEl || !document.getElementById('map3d-canvas')) return;
    var canvasWrapper = document.getElementById('map3d-canvas');
    var rect = canvasWrapper.getBoundingClientRect();
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
  }

  function animate() {
    if (!document.getElementById('map3d-canvas')) {
      cancelAnimationFrame(animationId);
      return;
    }
    animationId = requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  async function buildShelves() {
    var [locations, inventory, products] = await Promise.all([
      WMS.Locations.getAll(),
      WMS.Inventory.getAll(),
      WMS.Products.getAll()
    ]);
    
    var searchInput = document.getElementById('globalSearch');
    var searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

    var toRemove = [];
    scene.children.forEach(function(c) {
      if (c.userData && (c.userData.isShelf || c.userData.isSlot)) toRemove.push(c);
    });
    toRemove.forEach(function(c) { scene.remove(c); });

    var shelfMap = {};
    locations.forEach(function(loc) {
      var match = loc.code.match(/^([A-Z])-M(\d+)$/);
      if (match) {
        var letter = match[1];
        if (!shelfMap[letter]) shelfMap[letter] = [];
        shelfMap[letter].push(loc);
      }
    });

    var letters = Object.keys(shelfMap).sort();
    var shelfDepth = 1.8;
    var moduleWidth = 3;
    var rowHeight = 1.5;
    var aisleWidth = 4;

    function createTextSprite(text, color) {
      var canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 64;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = color || '#ffffff'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
      ctx.fillText(text, 64, 44);
      var texture = new THREE.CanvasTexture(canvas);
      var material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      var sprite = new THREE.Sprite(material); sprite.scale.set(1.5, 0.75, 1);
      return sprite;
    }
    
    var startZ = -((letters.length * (shelfDepth + aisleWidth)) / 2);

    letters.forEach(function(letter, shelfIdx) {
      var mods = shelfMap[letter];
      mods.sort(function(a,b) {
        var m1 = parseInt(a.code.split('-M')[1]);
        var m2 = parseInt(b.code.split('-M')[1]);
        return m1 - m2;
      });

      var startX = -((mods.length * moduleWidth) / 2);
      var zPos = startZ + (shelfIdx * (shelfDepth + aisleWidth));

      mods.forEach(function(mod, modIdx) {
        var xPos = startX + (modIdx * moduleWidth) + (moduleWidth/2);
        var cubeX = mod.x_pos !== undefined ? mod.x_pos : xPos;
        var cubeZ = mod.z_pos !== undefined ? mod.z_pos : zPos;
        var cubeRot = mod.rotation !== undefined ? (mod.rotation * Math.PI / 180) : 0;

        var numRows = mod.rows || 1;
        var slotsPerRow = mod.slotsPerRow || 3;
        var totalHeight = numRows * rowHeight;
        
        var moduleGroup = new THREE.Group();
        moduleGroup.position.set(cubeX, totalHeight/2, cubeZ);
        moduleGroup.rotation.y = cubeRot;

        var sw = (moduleWidth - 0.2) / slotsPerRow;
        
        for (var r = 0; r < numRows; r++) {
          for (var s = 1; s <= slotsPerRow; s++) {
            var slotInv = inventory.filter(function(inv) {
              return inv.locationId === mod.id && 
                     (parseInt(inv.row) === r || inv.row === String(r)) && 
                     (parseInt(inv.pos) === s || inv.pos === String(s));
            });
            var stockQty = slotInv.reduce(function(sum, i) { return sum + (i.quantity||0); }, 0);
            
            var color = 0x4a5568; 
            var hasLowStock = false;
            var isSearched = false;

            if (stockQty > 0) {
              color = 0xef4444; 
              slotInv.forEach(function(i) {
                var p = products.find(function(prd){return prd.id===i.productId;});
                if (p) {
                  if (p.minStock > 0 && p.totalStock <= p.minStock) hasLowStock = true;
                  if (searchTerm && (p.sku.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm))) isSearched = true;
                }
              });
            }

            if (isSearched) color = 0xffeb3b;
            else if (hasLowStock) color = 0x3b82f6;

            var slotGeom = new THREE.BoxGeometry(sw - 0.05, rowHeight - 0.1, shelfDepth);
            var slotMat = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: 0.8 });
            var slotMesh = new THREE.Mesh(slotGeom, slotMat);
            
            var lx = (-moduleWidth/2) + ((s-1) * sw) + (sw/2) + 0.1;
            var ly = (-totalHeight/2) + (r * rowHeight) + (rowHeight/2);
            slotMesh.position.set(lx, ly, 0);
            
            var edges = new THREE.EdgesGeometry(slotGeom);
            var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a202c, transparent: true, opacity: 0.5 }));
            slotMesh.add(line);
            
            slotMesh.userData = {
              isSlot: true,
              slotName: mod.code + '-F' + r + '-P' + s,
              items: slotInv.map(function(i) {
                  var p = products.find(function(prd){return prd.id===i.productId;});
                  return (p ? p.sku : i.productId) + ': ' + i.quantity + ' uds';
              })
            };
            moduleGroup.add(slotMesh);
          }
        }

        var modLabel = createTextSprite(mod.code, '#fff');
        modLabel.position.set(0, (totalHeight/2) + 0.5, 0);
        moduleGroup.add(modLabel);

        moduleGroup.userData = { isShelf: true, code: mod.code };
        scene.add(moduleGroup);
      });
    });
  }

  function setupRaycaster(wrapper, cam, scn) {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var tooltip = document.getElementById('tooltip3d');

    wrapper.addEventListener('mousemove', function(e) {
      var rect = wrapper.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cam);
      var intersects = raycaster.intersectObjects(scn.children, true);
      
      var found = null;
      for (var i=0; i<intersects.length; i++) {
        if (intersects[i].object.userData && intersects[i].object.userData.isSlot) {
          found = intersects[i].object;
          break;
        }
      }

      if (found) {
        wrapper.style.cursor = 'pointer';
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
        tooltip.innerHTML = '<strong>' + found.userData.slotName + '</strong><br>' +
                            (found.userData.items.length > 0 ? 
                              '<div style="margin-top:4px;font-size:11px">' + found.userData.items.join('<br>') + '</div>' : 
                              '<span style="color:#a0aec0">Vacío</span>');
      } else {
        tooltip.style.display = 'none';
        wrapper.style.cursor = 'default';
      }
    });

    wrapper.addEventListener('mouseleave', function() { tooltip.style.display = 'none'; });
  }

})();
