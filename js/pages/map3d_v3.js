(function() {
  var WMS = window.WMS || {};

  var scene, camera, renderer, controls, animationId;
  var transformControls;
  var editMode = false;
  var selectedObject = null;
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
          '<h2 style="margin:0;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.5)">🗺️ Mapa 3D del Almacén</h2>' +
          '<p style="color:var(--text-secondary);text-shadow:0 1px 2px rgba(0,0,0,0.5);margin-top:var(--space-1)">Visualización en tiempo real</p>' +
        '</div>' +
        '<div style="position:absolute;bottom:var(--space-4);right:var(--space-4);z-index:10;background:rgba(11,14,20,0.8);backdrop-filter:blur(8px);padding:var(--space-3);border-radius:var(--radius-lg);border:1px solid rgba(255,255,255,0.05);color:#fff">' +
          '<h4 style="margin-bottom:var(--space-2);font-size:var(--font-sm)">Leyenda de Ocupación</h4>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);margin-bottom:var(--space-1)"><span style="display:inline-block;width:12px;height:12px;background:#ef4444;border-radius:2px"></span> Ocupado</div>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);margin-bottom:var(--space-1)"><span style="display:inline-block;width:12px;height:12px;background:#3b82f6;border-radius:2px"></span> Stock Bajo Mínimo</div>' +
          '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs)"><span style="display:inline-block;width:12px;height:12px;background:#4a5568;border-radius:2px"></span> Vacío</div>' +
          '<button class="btn btn-secondary" style="margin-top:var(--space-3);width:100%;padding:var(--space-1);font-size:var(--font-xs)" id="resetCameraBtn">Centrar Cámara</button>' +
        '</div>' +
        '<div style="position:absolute;top:var(--space-4);left:50%;transform:translateX(-50%);z-index:20;width:300px">' +
          '<div style="background:rgba(11,14,20,0.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:50px;padding:var(--space-1) var(--space-4);display:flex;align-items:center;gap:var(--space-2)">' +
            '<span style="font-size:16px">🔍</span>' +
            '<input type="text" id="mapSearchInput" placeholder="Buscar pieza (SKU)..." style="background:transparent;border:none;color:#fff;width:100%;padding:var(--space-2) 0;outline:none;font-size:var(--font-sm)">' +
          '</div>' +
        '</div>' +
        '<div id="tooltip3d" style="position:absolute;display:none;background:rgba(0,0,0,0.9);color:#fff;padding:8px 12px;border-radius:4px;font-size:12px;pointer-events:none;z-index:20;border:1px solid var(--border-color);box-shadow:var(--shadow-lg);transform:translate(-50%, -100%);margin-top:-10px"></div>' +
        '<div id="edit-controls" style="position:absolute;top:var(--space-4);right:var(--space-4);z-index:30;display:flex;flex-direction:column;gap:var(--space-2)">' +
          '<button class="btn btn-primary" id="toggleEditBtn">🛠️ Modo Edición: OFF</button>' +
          '<div id="edit-actions" style="display:none;flex-direction:column;gap:var(--space-2)">' +
            '<button class="btn btn-secondary" id="rotate180Btn" style="display:none">🔄 Girar 180°</button>' +
            '<button class="btn btn-success" id="saveLayoutBtn">💾 Guardar Cambios</button>' +
            '<div id="selection-hint" style="background:rgba(0,0,0,0.8);padding:var(--space-2);border-radius:var(--radius-md);font-size:var(--font-xs);color:#34d399">Selecciona una estantería completa para moverla o girarla</div>' +
          '</div>' +
        '</div>' +
      '</div>';

      var canvasWrapper = document.getElementById('map3d-canvas');
      var rect = canvasWrapper.getBoundingClientRect();
      var width = rect.width || canvasWrapper.clientWidth || 800;
      var height = rect.height || canvasWrapper.clientHeight || 600;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b0e14);
      
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 30, 40);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      canvasWrapper.appendChild(renderer.domElement);

      if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
      }

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(20, 40, 20);
      scene.add(dirLight);


      await buildShelves();
      animate();

      window.addEventListener('resize', onWindowResize);
      var rBtn = document.getElementById('resetCameraBtn');
      if (rBtn) rBtn.addEventListener('click', resetCamera);

      var sInput = document.getElementById('mapSearchInput');
      if (sInput) sInput.addEventListener('input', function(e) { highlightProduct(e.target.value.trim()); });
      
      setupRaycaster(canvasWrapper, camera, scene);
      setupLayoutEditor();
      
      console.log("3D Check: Init finished successfully");
    } catch (err) {
      console.error("3D Error in init3D:", err);
      el.innerHTML = '<div class="card"><div class="card-body"><h3 class="text-danger">Error de inicialización 3D</h3><p>' + err.message + '</p></div></div>';
    }
  }


  function resetCamera() {
    camera.position.set(0, 30, 40);
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
    var [locations, inventory, products, lowStockProducts] = await Promise.all([
      WMS.Locations.getAll(),
      WMS.Inventory.getAll(),
      WMS.Products.getAll(),
      WMS.Stats.getLowStockProducts()
    ]);
    var lowStockProdIds = lowStockProducts.map(function(p) { return p.id; });

    // Clean previous shelves and environment
    var toRemove = [];
    scene.children.forEach(function(c) {
      if (c.userData && (c.userData.isShelfGroup || c.userData.isShelf || c.userData.isSlot || c.userData.isEnvironment)) toRemove.push(c);
    });
    toRemove.forEach(function(c) { scene.remove(c); });

    if (locations.length === 0) {
      WMS.showToast('No hay ubicaciones configuradas para mostrar en el mapa.', 'info');
      return;
    }

    // Group locations by shelf letter
    var shelfMap = {}; // { 'A': [locs], 'B': [locs] }
    locations.forEach(function(loc) {
      var match = loc.code.match(/^([A-Z])-M(\d+)$/);
      if (match) {
        var letter = match[1];
        if (!shelfMap[letter]) shelfMap[letter] = [];
        shelfMap[letter].push(loc);
      }
    });

    var letters = Object.keys(shelfMap).sort();
    
    // Layout parameters
    var shelfDepth = 1.8;
    var moduleWidth = 3;
    var rowHeight = 1.5;
    var aisleWidth = 4;

    function createTextSprite(text, color) {
      var canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = color || '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, 64, 44);
      
      var texture = new THREE.CanvasTexture(canvas);
      var material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      var sprite = new THREE.Sprite(material);
      sprite.scale.set(1.5, 0.75, 1);
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

      var shelfGroup = new THREE.Group();
      shelfGroup.userData = { isShelfGroup: true, letter: letter };
      scene.add(shelfGroup);

      var sumX = 0, sumZ = 0;
      mods.forEach(function(mod, modIdx) {
        var xPos = startX + (modIdx * moduleWidth) + (moduleWidth/2);
        var cubeX = (mod.x_pos !== undefined && mod.x_pos !== null) ? mod.x_pos : xPos;
        var cubeZ = (mod.z_pos !== undefined && mod.z_pos !== null) ? mod.z_pos : zPos;
        sumX += cubeX;
        sumZ += cubeZ;
      });
      var cx = sumX / mods.length;
      var cz = sumZ / mods.length;
      shelfGroup.position.set(cx, 0, cz);

      mods.forEach(function(mod, modIdx) {
        var xPos = startX + (modIdx * moduleWidth) + (moduleWidth/2);
        var cubeX = (mod.x_pos !== undefined && mod.x_pos !== null) ? mod.x_pos : xPos;
        var cubeZ = (mod.z_pos !== undefined && mod.z_pos !== null) ? mod.z_pos : zPos;
        var cubeRot = (mod.rotation !== undefined && mod.rotation !== null) ? (mod.rotation * Math.PI / 180) : 0;

        var numRows = mod.rows || 1;
        var slotsPerRow = mod.slotsPerRow || 3;
        var totalHeight = numRows * rowHeight;
        
        var moduleGroup = new THREE.Group();
        moduleGroup.position.set(cubeX - cx, totalHeight/2, cubeZ - cz);
        moduleGroup.rotation.y = cubeRot;

        var modInventory = inventory.filter(function(inv) { return inv.locationId === mod.id; });

        // Create the structure: N slots per row
        var sw = (moduleWidth - 0.2) / slotsPerRow; 
        
        for (var r = 0; r < numRows; r++) {
          for (var s = 0; s < slotsPerRow; s++) {
            // Find stock for THIS slot
            // Assuming row matches 'r' and pos matches 's+1' (adjust if 1-based indexing differs)
            var slotInv = modInventory.filter(function(inv) { 
              return (parseInt(inv.row) === r || inv.row === String(r)) && 
                     (parseInt(inv.pos) === (s + 1) || inv.pos === String(s + 1)); 
            });

            var stockQty = slotInv.reduce(function(sum, i) { return sum + (i.quantity || 0); }, 0);
            var isLowStock = false;
            var slotSkus = [];
            
            slotInv.forEach(function(inv) {
              if (lowStockProdIds.includes(inv.productId)) isLowStock = true;
              var p = products.find(function(pro){ return pro.id === inv.productId; });
              if (p && !slotSkus.includes(p.sku)) slotSkus.push(p.sku);
            });

            var color = 0x4a5568; // Empty
            if (stockQty > 0) {
              color = isLowStock ? 0x3b82f6 : 0xef4444; // Blue if low stock, Red if occupied
            }

            var slotGeom = new THREE.BoxGeometry(sw - 0.05, rowHeight - 0.1, shelfDepth);
            var slotMat = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: 0.8 });
            var slotMesh = new THREE.Mesh(slotGeom, slotMat);
            
            // Local position inside the module
            var lx = (-moduleWidth/2) + (s * sw) + (sw/2);
            var ly = (-totalHeight/2) + (r * rowHeight) + (rowHeight/2);
            slotMesh.position.set(lx, ly, 0);
            
            slotMesh.userData = {
              isSlot: true,
              locationCode: mod.code,
              row: r,
              pos: s + 1,
              stock: stockQty,
              skus: slotSkus,
              originalColor: color,
              slotName: mod.code + '-F' + r + '-P' + (s + 1)
            };

            // Edge
            var edges = new THREE.EdgesGeometry(slotGeom);
            var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
            slotMesh.add(line);
            
            moduleGroup.add(slotMesh);
          }
        }

        // Add 3D Text Label for the module
        var sprite = createTextSprite(mod.code, '#ffffff');
        sprite.position.set(0, (totalHeight / 2) + 0.15, 0); // Above the module center
        moduleGroup.add(sprite);

        moduleGroup.userData = {
          isShelf: true,
          code: mod.code,
          name: mod.name,
          id: mod.id // Important for saving
        };

        shelfGroup.add(moduleGroup);
      });
    });

    // Create dynamic floor/grid based on module positions
    var box = new THREE.Box3();
    scene.traverse(function(node) {
      if (node.userData && (node.userData.isShelf || node.userData.isSlot)) {
        box.expandByObject(node);
      }
    });

    if (!box.isEmpty()) {
      var size = new THREE.Vector3();
      box.getSize(size);
      var center = new THREE.Vector3();
      box.getCenter(center);
      
      var margin = 10;
      var gridWidth = Math.max(size.x, size.z) + margin;
      var gridDiv = Math.round(gridWidth);
      
      var grid = new THREE.GridHelper(gridWidth, gridDiv, 0x333333, 0x222222);
      grid.position.set(center.x, 0, center.z);
      grid.userData = { isEnvironment: true };
      scene.add(grid);

      var floorGeom = new THREE.PlaneGeometry(gridWidth, gridWidth);
      var floorMat = new THREE.MeshPhongMaterial({ color: 0x07090d, side: THREE.DoubleSide });
      var floor = new THREE.Mesh(floorGeom, floorMat);
      floor.rotation.x = Math.PI / 2;
      floor.position.set(center.x, -0.01, center.z);
      floor.userData = { isEnvironment: true };
      scene.add(floor);
      
      // Initially focus camera if everything is new
      if (locations.length > 0 && locations.every(l => l.x_pos === null)) {
         camera.position.set(center.x, 30, center.z + 40);
         controls.target.set(center.x, 0, center.z);
      }
    }
  }


  function setupRaycaster(wrapper, cam, scn) {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var tooltip = document.getElementById('tooltip3d');
    var hoveredObj = null;

    wrapper.addEventListener('mousemove', function(e) {
      var rect = wrapper.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cam);
      var intersects = raycaster.intersectObjects(scn.children, true);
      
      var found = false;
      for (var i=0; i<intersects.length; i++) {
        var obj = intersects[i].object;
        // Search up the group for userData
        var target = obj;
        if (target && target.userData && target.userData.isSlot) {
          found = true;
          if (hoveredObj !== target) {
            hoveredObj = target;
            wrapper.style.cursor = 'pointer';
          }
          
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX + 'px';
          tooltip.style.top = e.clientY + 'px';
          tooltip.innerHTML = '<strong>' + (target.userData.slotName || target.userData.locationCode) + '</strong><br>' +
                              '<span style="color:#a0aec0">Fila: ' + target.userData.row + ', Hueco: ' + target.userData.pos + '</span><br>' +
                              '<div style="margin-top:4px">Stock: <strong>' + WMS.formatNumber(target.userData.stock) + '</strong> uds</div>' +
                              (target.userData.skus.length > 0 ? '<div style="color:var(--primary-light);font-size:10px;margin-top:2px">Piezas: ' + target.userData.skus.join(', ') + '</div>' : '');
          break;
        }
      }

      if (!found) {
        hoveredObj = null;
        tooltip.style.display = 'none';
        wrapper.style.cursor = 'default';
      }
    });

    wrapper.addEventListener('mouseleave', function() {
      tooltip.style.display = 'none';
      hoveredObj = null;
    });
  }

  function setupLayoutEditor() {
    console.log('setupLayoutEditor called');
    if (typeof THREE.TransformControls === 'undefined') {
      console.warn("TransformControls not loaded from external source yet. Retrying...");
      setTimeout(setupLayoutEditor, 500);
      return;
    }

    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate'); 
    transformControls.showY = false; // Disable vertical movement
    
    transformControls.addEventListener('dragging-changed', function(event) {
      if (controls) controls.enabled = !event.value;
    });

    scene.add(transformControls);

    var toggleBtn = document.getElementById('toggleEditBtn');
    var editActions = document.getElementById('edit-actions');
    var saveBtn = document.getElementById('saveLayoutBtn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        editMode = !editMode;
        console.log('Toggle Edit button clicked, editMode now', editMode);
        toggleBtn.textContent = editMode ? '🛠️ Modo Edición: ON' : '🛠️ Modo Edición: OFF';
        toggleBtn.className = editMode ? 'btn btn-danger' : 'btn btn-primary';
        editActions.style.display = editMode ? 'flex' : 'none';
        if (!editMode) {
          transformControls.detach();
          if (selectedObject) highlightSelectedShelf(selectedObject, false);
          selectedObject = null;
          if (rotateBtn) rotateBtn.style.display = 'none';
        }
      });
    }

    var rotateBtn = document.getElementById('rotate180Btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', function() {
        if (selectedObject) {
          selectedObject.rotation.y += Math.PI;
          // Trigger a re-render/update if needed, but animate handles it
        } else {
          WMS.showToast('Selecciona un módulo primero', 'info');
        }
      });
    }

    function highlightSelectedShelf(obj, isSelected) {
      if (rotateBtn) rotateBtn.style.display = isSelected ? 'flex' : 'none';
      var hint = document.getElementById('selection-hint');
      if (hint) {
        if (isSelected) {
          hint.innerHTML = 'Estantería <strong>' + (obj.userData.letter || '') + '</strong> seleccionada.<br>Usa las flechas para mover o el botón para girar.';
          hint.style.color = '#facc15';
        } else {
          hint.innerHTML = 'Selecciona una estantería completa para moverla o girarla';
          hint.style.color = '#34d399';
        }
      }

      obj.traverse(function(node) {
        if (node.userData && node.userData.isSlot) {
          if (isSelected) {
            node.material.emissive.set(0x444400); // Yellowish glow
            node.material.emissiveIntensity = 0.4;
          } else {
            node.material.emissive.set(0x000000);
            node.material.emissiveIntensity = 0;
          }
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var shelfGroups = scene.children.filter(function(c) { return c.userData && c.userData.isShelfGroup; });
        var count = 0;
        shelfGroups.forEach(function(sg) {
          sg.children.forEach(function(modGroup) {
            if (modGroup.userData && modGroup.userData.id) {
              var wp = new THREE.Vector3();
              modGroup.getWorldPosition(wp);
              var euler = new THREE.Euler().setFromQuaternion(modGroup.getWorldQuaternion(), 'YXZ');
              
              WMS.Locations.update(modGroup.userData.id, {
                x_pos: wp.x,
                z_pos: wp.z,
                rotation: Math.round(euler.y * 180 / Math.PI)
              });
              count++;
            }
          });
        });
        WMS.showToast('Configuración de diseño guardada (' + count + ' módulos).', 'success');
        editMode = false;
        if (toggleBtn) toggleBtn.click();
      });
    }

    renderer.domElement.addEventListener('pointerdown', function(e) {
      if (!editMode) return;
      
      var rect = renderer.domElement.getBoundingClientRect();
      var mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(scene.children, true);

      var hitGizmo = false;
      var hitShelf = null;

      for (var i = 0; i < intersects.length; i++) {
        var obj = intersects[i].object;
        
        var p = obj;
        while(p) {
          if (p === transformControls) { hitGizmo = true; break; }
          p = p.parent;
        }
        if (hitGizmo) break;

        p = obj;
        while (p && (!p.userData || !p.userData.isShelfGroup)) {
          p = p.parent;
        }
        if (p && p.userData && p.userData.isShelfGroup) {
          hitShelf = p;
          break;
        }
      }

      if (hitGizmo) return;

      if (hitShelf) {
        if (selectedObject !== hitShelf) {
          if (selectedObject) highlightSelectedShelf(selectedObject, false);
          selectedObject = hitShelf;
          highlightSelectedShelf(selectedObject, true);
          transformControls.attach(hitShelf);
          transformControls.setMode('translate');
          transformControls.showY = false;
        }
      } else {
        if (selectedObject) highlightSelectedShelf(selectedObject, false);
        selectedObject = null;
        transformControls.detach();
      }
    });
  }

  function highlightProduct(sku) {
    if (!scene) return;
    sku = (sku || '').toLowerCase();
    
    scene.traverse(function(node) {
      if (node.userData && node.userData.isSlot) {
        var matches = false;
        if (sku !== '') {
          matches = node.userData.skus.some(function(s) { return s.toLowerCase().includes(sku); });
        }
        
        if (matches) {
          node.material.color.set(0xfacc15); // Yellow highlight
          node.material.opacity = 1.0;
          if (node.material.emissive) {
            node.material.emissive.set(0xfacc15);
            node.material.emissiveIntensity = 0.5;
          }
        } else {
          node.material.color.set(node.userData.originalColor);
          node.material.opacity = 0.8;
          if (node.material.emissive) {
            node.material.emissive.set(0x000000);
            node.material.emissiveIntensity = 0;
          }
        }
      }
    });
  }

})();
