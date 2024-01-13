require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const sqlite3=require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const axios = require('axios');
const { error } = require('console');


// Configuración de reCAPTCHA
const recaptcha = new Recaptcha('6LezRz8pAAAAAJ6atgANeqNh2fneG5B8cES35W0d', '6LezRz8pAAAAACb7c5GNRUiJTdYjKpWmyBgI0y0b');
app.use(recaptcha.middleware.verify);
// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.json());
app.set('trust proxy', true);
app.use(express.static(__dirname+'/'));
// Configurar middleware para usar sesiones
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
  }));
  
  
  //administrador
app.get('/admin', (req, res) => {
  if (req.session.loggedin) {
    const sqlProductos = "SELECT * FROM productos ORDER BY id";
    const sqlCategorias = "SELECT * FROM categorias ORDER BY id";
    const sqlImagenes = "SELECT * FROM imagenes ORDER BY id";

    db.all(sqlProductos, [], (errProductos, rowsProductos) => {
      if (errProductos) {
        return console.error(errProductos.message);
      } else {
        db.all(sqlCategorias, [], (errCategorias, rowsCategorias) => {
          if (errCategorias) {
            return console.error(errCategorias.message);
          } else {
            db.all(sqlImagenes, [], (errImagenes, rowsImagenes) => {
              if (errImagenes) {
                return console.error(errImagenes.message);
              } else {
                res.render("admin", { productos: rowsProductos, categorias: rowsCategorias, imagenes: rowsImagenes });
              }
            });
          }
        });
      }
    });
  } else {
    res.redirect('/login');
  }
});
//Productos
  app.get('/admin/productos/crear', (req, res) => {
    if (req.session.loggedin) {
      const sql = "SELECT * FROM categorias";
      db.all(sql, (err, rows) => {
        if (err) {
          console.log(err);
          res.redirect('/error');
        } else {
          res.render('admincrear', { productos: {}, categorias: rows });
        }
      });
    } else {
      res.redirect('/login');
    }
   });

   app.post('/admin/productos/crear', (req, res) => {
    if (req.session.loggedin) {
      const sql="INSERT INTO PRODUCTOS (nombre, codigo, precio, descripcion, marca, uso, categoria_id) VALUES (?,?,?,?,?,?,?)";
 const nuevo_producto = [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.uso, req.body.categoria_id];
 db.run(sql, nuevo_producto, err => {
  if(err) {
    return console.error(err.message);
  }else {
    res.redirect('/admin');
  }
  })
    } else {
      res.redirect('login');
    }  
  });
  app.get('/admin/productos/update/:id', (req, res) => {
    if (req.session.loggedin) {
      const id = req.params.id;
      const sql = "SELECT * FROM productos WHERE id=?";
      const sqlCategorias = "SELECT * FROM categorias";
  
      db.get(sql, id, (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          db.all(sqlCategorias, (err, categorias) => {
            if (err) {
              console.log(err);
            } else {
              res.render('admineditar', { productos: rows, categorias: categorias });
            }
          });
        }
      });
    } else {
      res.redirect('/login');
    }
   });
   app.post('/admin/productos/update/:id', (req, res) => {
    const id=req.params.id;
  const nuevo_producto = [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.uso, req.body.categoria_id, id];
 const sql = "UPDATE PRODUCTOS SET nombre=?, codigo=?, precio=?, descripcion=?, marca=?, uso=?, categoria_id=? WHERE (id=?)";
  db.run(sql, nuevo_producto, err => {
   if(err) {
     return console.error(err.message);
   }else {
     res.redirect('/admin');
   }
   })
   });
   app.get('/admin/productos/delete/:id', (req, res) => {
    if (req.session.loggedin == true) {
      const id =req.params.id;
      const sql="SELECT * FROM Productos WHERE ID=?";
      db.get(sql,id,(err,rows)=>{
        res.render('admineliminar.ejs', {productos:rows});
      })
    } else {
      res.redirect('/login');
    }
   });
   app.post('/admin/productos/delete/:id', (req, res) => {
    if (req.session.loggedin) {
      const id=req.params.id;
    const sql="DELETE FROM PRODUCTOS where id=?";
    db.run(sql, id, err => {
      if (err) {
        return console.error(err.message);
      } else {
        res.redirect("/admin");
      }
    })
    } else {
     res.redirect('/login'); 
    }
   });
//Categorias
app.get('/admin/categorias/crear', (req, res) => {
  if (req.session.loggedin) {
    res.render('categoriacrear', {categorias:{}});
  } else {
    res.redirect('/login');
  }
 });

 app.post('/admin/categorias/crear', (req, res) => {
  if (req.session.loggedin) {
    const sql="INSERT INTO categorias (nombre) VALUES (?)";
const nueva_categoria = [req.body.nombre];
db.run(sql, nueva_categoria, err => {
if(err) {
  return console.error(err.message);
}else {
  res.redirect('/admin');
}
})
  } else {
    res.redirect('login');
  }  
});
app.get('/admin/categorias/update/:id', (req, res) => {
  if (req.session.loggedin) {
    const id=req.params.id;
  const sql="SELECT * FROM categorias where id=?";
  db.get(sql, id, (err, rows)=>{
    res.render('categoriaeditar', {categorias:rows});
  })
  } else {
   res.redirect('/login'); 
  }
 });
 app.post('/admin/categorias/update/:id', (req, res) => {
  if (req.session.loggedin) {
    const id=req.params.id;
    const nueva_categoria = [req.body.nombre, id];
    const sql = "UPDATE categorias SET nombre=? WHERE (id=?)";
    db.run(sql, nueva_categoria, err => {
     if(err) {
       return console.error(err.message);
     }else {
       res.redirect('/admin');
     }
     })
  } else {
    res.redirect('/login'); 
  }
 
 });
 app.get('/admin/categorias/delete/:id', (req, res) => {
  if (req.session.loggedin == true) {
    const id =req.params.id;
    const sql="SELECT * FROM categorias WHERE ID=?";
    db.get(sql,id,(err,rows)=>{
      res.render('categoriaeliminar.ejs', {categorias:rows});
    })
  } else {
    res.redirect('/login');
  }
 });
 app.post('/admin/categorias/delete/:id', (req, res) => {
  if (req.session.loggedin) {
    const id=req.params.id;
  const sql="DELETE FROM categorias where id=?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    } else {
      res.redirect("/admin");
    }
  })
  } else {
   res.redirect('/login'); 
  }
 });

 //Imagenes

 app.get('/admin/imagenes/crear', (req, res) => {
  if (req.session.loggedin == true) {
    const sql = "SELECT * FROM productos";
    db.all(sql, (err, rows) => {
      if (err) {
        console.log(err);
        res.redirect('/error');
      } else {
        res.render('imagenescrear', { imagenes: {}, productos: rows });
      }
    });
  } else {
    res.redirect('/login');
  }
});

 app.post('/admin/imagenes/crear', (req, res) => {
  if (req.session.loggedin) {
    const sql="INSERT INTO imagenes (url, destacado, producto_id) VALUES (?,?,?)";
const nueva_imagen = [req.body.url, req.body.destacado, req.body.producto_id];
db.run(sql, nueva_imagen, err => {
if(err) {
  return console.error(err.message);
}else {
  res.redirect('/admin');
}
})
  } else {
    res.redirect('login');
  }  
});
app.get('/admin/imagenes/update/:id', (req, res) => {
  if (req.session.loggedin) {
    const id = req.params.id;
    const sql = "SELECT * FROM imagenes WHERE id=?";
    const sqlProductos = "SELECT * FROM productos";

    db.get(sql, id, (err, rows) => {
      if (err) {
        console.log(err);
        res.redirect('/error');
      } else {
        db.all(sqlProductos, (err, productos) => {
          if (err) {
            console.log(err);
            res.redirect('/error');
          } else {
            res.render('imageneseditar', { imagenes: rows, productos: productos });
          }
        });
      }
    });
  } else {
    res.redirect('/login');
  }
});
 app.post('/admin/imagenes/update/:id', (req, res) => {
  const id=req.params.id;
const nueva_categoria = [req.body.url, req.body.destacado, req.body.producto_id, id];
const sql = "UPDATE imagenes SET url=?, destacado=?,producto_id=? WHERE (id=?)";
db.run(sql, nueva_categoria, err => {
 if(err) {
   return console.error(err.message);
 }else {
   res.redirect('/admin');
 }
 })
 });
 app.get('/admin/imagenes/delete/:id', (req, res) => {
  if (req.session.loggedin == true) {
    const id =req.params.id;
    const sql="SELECT * FROM imagenes WHERE ID=?";
    db.get(sql,id,(err,rows)=>{
      res.render('imageneliminar.ejs', {imagenes:rows});
    })
  } else {
    res.redirect('/login');
  }
 });
 app.post('/admin/imagenes/delete/:id', (req, res) => {
  if (req.session.loggedin) {
    const id=req.params.id;
  const sql="DELETE FROM imagenes where id=?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    } else {
      res.redirect("/admin");
    }
  })
  } else {
   res.redirect('/login'); 
  }
 });
// Filtro por nombre
app.post('/buscar', (req, res) => {
  const perfil = req.session.perfil;
  const { nombre, categoria, descripcion, marca, uso } = req.body;
  let sql = 'SELECT productos.id, productos.nombre, productos.precio, productos.codigo, productos.descripcion, productos.marca, productos.uso, categorias.nombre AS categoriaNombre, imagenes.url, imagenes.destacado FROM productos INNER JOIN categorias ON productos.categoria_id = categorias.id INNER JOIN imagenes ON productos.id = imagenes.producto_id where 1=1';

  const params = [];
  if (nombre) {
    sql += " AND productos.nombre LIKE '%' || ? || '%'";
    params.push(nombre);
  }

  if (categoria) {
    sql += " AND categoriaNombre = ?";
    params.push(categoria);
  }

  if (descripcion) {
    sql += " AND productos.descripcion LIKE '%' || ? || '%'";
    params.push(descripcion);
  }

  if (marca) {
    sql += " AND productos.marca = ?";
    params.push(marca);
  }

  if (uso) {
    sql += " AND productos.uso LIKE '%' || ? || '%'";
    params.push(uso);
  }

  db.all(sql, params, (err, rowsProductos) => {
    if (err) {
      return console.error(err.message);
    } else {
              res.render("home", { productos: rowsProductos, perfil });
    }
  });
});
app.get('/info/:id', (req, res) => {
  const perfil = req.session.perfil;
  const id = req.params.id;
  const sql = "SELECT * FROM productos WHERE id = ?";
  const sql2 = "SELECT * FROM imagenes WHERE producto_id = ?";
  const sql3 = "SELECT * FROM categorias WHERE id IN (SELECT categoria_id FROM productos WHERE id = ?)";
  
  db.get(sql, id, (err, productos) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (!productos) {
      res.status(404).send("Producto no encontrado.");
      return;
    }

    db.get(sql2, id, (err, imagenes) => {
      if (err) {
        console.error(err);
        return;
      }

      db.get(sql3, id, (err, categorias) => {
        if (err) {
          console.error(err);
          return;
        }

        res.render('info', { productos, imagenes, categorias, id,  perfil: perfil });
      });
    });
  });
});

 
app.get('/', function(req, res) {
  const perfil = req.session.perfil;
  const sql = 'SELECT productos.id, productos.nombre, productos.precio, productos.codigo, productos.descripcion, productos.marca, productos.uso, categorias.nombre AS categoriaNombre, imagenes.url, imagenes.destacado FROM productos INNER JOIN categorias ON productos.categoria_id = categorias.id INNER JOIN imagenes ON productos.id = imagenes.producto_id';
  db.all(sql, [], (errProductos, rowsProductos) => {
    if (errProductos) {
      return console.error(errProductos.message);
    } else {
      res.render("home", { productos: rowsProductos, perfil: perfil });
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
    res.redirect('/login');
 });

 app.get('/loginError', (req, res)=> {
  if (req.session.loggedin || req.session.perfil) {
    res.redirect('/');
  } else {
      res.render('loginError');
    }
});
 app.get('/login', (req, res) => {
  if (!req.session.loggedin && req.session.perfil == null) {
    res.render('login');
  } else if (req.session.loggedin) {
    res.redirect('admin');
  } else {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMINUSERNAME && password === process.env.ADMINPASSWORD) {
    req.session.loggedin = true;
    req.session.perfil = username;
    res.redirect('/admin');
  } else {
    const query = 'SELECT * FROM Clientes WHERE cliente = ? OR correo = ?';
    db.all(query, [username, username], (err, rows) => {
      if (rows.length > 0) {
        const element = rows[0];
        bcrypt.compare(password, element.password, (err, isMatch) => {
          if (isMatch) {
            req.session.perfil = element.cliente;
            res.redirect('/');
          } else {
            res.redirect('/loginError');
          }
        });
      } else {
        res.redirect('/loginError');
      }
    });
  }
});
 
app.get('/signup', recaptcha.middleware.render, (req, res) => {
  if (!req.session.loggedin && req.session.perfil == null) {
    res.render('signup', { captcha: res.recaptcha });
  } else if (req.session.loggedin) {
    res.redirect('admin');
  } else {
    res.redirect('/');
  }
});

app.post('/signup', (req, res) => {
  const data = req.body;
  recaptcha.verify(req, (error, recaptchaData) => {
    if(data.cliente == process.env.ADMINUSERNAME){ 
      res.redirect('/loginerror');
    } else {
    if (!error) {
      db.all('SELECT * FROM Clientes WHERE cliente = ? OR correo = ?', [data.cliente, data.correo], (err, userdata) => {
        if (err) {
          console.error(err.message);
          res.render('error');
          return;
        }
        if (userdata.length > 0) {
          res.redirect('/loginError');
        } else {
          bcrypt.hash(data.password, 12)
            .then(hash => {
              data.password = hash;
              db.run('INSERT INTO Clientes (cliente, correo, password) VALUES (?, ?, ?)', [data.cliente, data.correo, data.password], (err) => {
                if (err) {
                  console.error(err.message);
                  res.render('error');
                } else {
                  req.session.perfil = data.cliente;
                  res.redirect('/');
                }
              });
            })
            .catch(err => {
              console.error(err);
              res.redirect('/loginerror');
            });
        }
      });
    } else {
      res.redirect('/loginerror');
    }
  }
  });
});
app.get('/payment/:id', (req, res) => {
  const id = req.params.id;
  const perfil = req.session.perfil;
  if (req.session.perfil == null) {
    res.redirect('/signup');
  } else if (req.session.loggedin) {
    res.redirect('/admin');
  } else {
    const sql = "SELECT * FROM productos WHERE id = ?";
    const sql2 = "SELECT * FROM imagenes WHERE producto_id = ?"
    const sql3 = "SELECT * FROM clientes WHERE cliente = ?"
    db.get(sql, id, (err, producto) => {
      if (err) {
        console.error(err);
        return;
      }
      
      if (!producto) {
        res.status(404).send("Producto no encontrado.");
        return;
      }
  
      db.get(sql2, id, (err, imagen) => {
        if (err) {
          console.error(err);
          return;
        }
        db.get(sql3, perfil, (err, datos) => {
          if (err) {
            console.error(err);
            return;
          }
          res.render('payment', { producto, datos, imagen, id, perfil });
        });
      });
    });
  }
  
});

app.post('/payments', async (req, res) => {
  const ip_cliente = req.ip;
  const {
    cvv,
    'expiration-month': expirationMonth,
    'expiration-year': expirationYear,
    name: fullName,
    description,
    reference,
    "card-number": tarjeta,
    precio,
    id: idProducto,
    idCliente: idCliente,
    cantidad
  } = req.body;
  
  const precioProducto = (precio * cantidad).toFixed(2);
  const payment = {
    amount: precioProducto,
    'card-number': tarjeta,
    cvv,
    'expiration-month': expirationMonth,
    'expiration-year': expirationYear,
    'full-name': fullName,
    currency: 'USD',
    description: idProducto,
    reference: idCliente
  };

  try {
    const response = await axios.post('https://fakepayment.onrender.com/payments', payment, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJkYXRlIjoiMjAyNC0wMS0wOVQwMTowOToxMS44ODJaIiwiaWF0IjoxNzA0NzYyNTUxfQ.PmGcg4bwkNT2GYB5C6m0ABAu9DUDVPX1gdF4QpEjoBM'
      }
    });
    const data = JSON.parse(JSON.stringify(response.data));
    const transactionId = data.data.transaction_id;
    const amount = data.data.amount;
    const date = data.data.date;
    const reference = data.data.reference;
    const description = data.data.description;
    const message = data.message;
    console.log(message);
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO transacciones(transaccion_id, cantidad, total_pagado, fecha, ip_cliente, cliente_id, producto_id) VALUES(?,?,?,?,?,?,?)`,
        [transactionId, cantidad, amount, date, ip_cliente, reference, description],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
    req.session.data = data;
    res.redirect("/resultado");
  } catch (error) {
    res.render('resultadoTransaccion', { error, data : null, idProducto });
  }
});
app.get('/resultado', (req, res) => {
  if (req.session.perfil == null) {
    res.redirect("/");
  } else if (req.session.loggedin) {
    res.redirect("/admin");
  } else {
    const data = req.session.data;

    res.render('resultadoTransaccion', { data, error: null });
  
    delete req.session.data;
  }
  
});
app.get('/admin/clientes', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect("/login");
  } else {
    const sql = 'SELECT * FROM clientes'
    db.all(sql, [], (err, clientes) => {
      if (err) {
        return console.error(err.message);
      } else {
        res.render("adminclientes", { clientes });
      }
    });
  }
});
app.get('/admin/transacciones', (req, res) => {
  if (!req.session.loggedin) {
    res.redirect("/login");
  } else {
    const sqlTransacciones = 'SELECT * FROM transacciones';
    const sqlProductos = 'SELECT * FROM productos';
    const sqlClientes = 'SELECT * FROM clientes';

    db.all(sqlTransacciones, [], (err, transacciones) => {
      if (err) {
        return console.error(err.message);
      } else {
        db.all(sqlProductos, [], (err, productos) => {
          if (err) {
            return console.error(err.message);
          } else {
            db.all(sqlClientes, [], (err, clientes) => {
              if (err) {
                return console.error(err.message);
              } else {
                res.render("admintransacciones", { transacciones, productos, clientes });
              }
            });
          }
        });
      }
    });
  }
});
app.get('/*', (req, res) => {
  res.redirect('/');
});











app.listen(3000);
console.log('Online');
const BlondeGarden = path.join(__dirname, "db", "base.db");
const db = new sqlite3.Database(BlondeGarden, err =>{
    if (err) {
        return console.error(err.message);
    } else {
        console.log("Online Database")
    }
})
db.run(`CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT
    )
    `);
db.run(` CREATE TABLE IF NOT EXISTS productos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nombre TEXT,
codigo TEXT NOT NULL,
precio REAL NOT NULL,
descripcion TEXT,
marca TEXT,
uso TEXT,
categoria_id INTEGER,
FOREIGN KEY(categoria_id) REFERENCES categorias(id)
)`);
db.run(` CREATE TABLE IF NOT EXISTS imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    destacado text,
    producto_id INTEGER,
    FOREIGN KEY(producto_id) REFERENCES productos(id)
)`);
db.run(` CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente TEXT UNIQUE,
  correo text unique,
  password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transacciones (
    transaccion_id TEXT PRIMARY KEY,
    cantidad INTEGER,
    total_pagado FLOAT,
    fecha datetime,
    ip_cliente TEXT,
    cliente_id TEXT,
    producto_id TEXT,
    FOREIGN KEY(cliente_id) REFERENCES clientes(id),
    FOREIGN KEY(producto_id) REFERENCES productos(id)
  )`);