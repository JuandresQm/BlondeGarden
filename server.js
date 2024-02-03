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
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const { error } = require('console');


// Configuración de reCAPTCHA
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);
app.use(recaptcha.middleware.verify);
// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
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
    const adminToken = req.cookies.adminToken;
  
    try {
      if (adminToken) {
        const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
  
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
                    res.render("admin", { productos: rowsProductos, categorias: rowsCategorias, imagenes: rowsImagenes});
                  }
                });
              }
            });
          }
        });
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      res.redirect('/login');
    }
  });
//Productos
app.get('/admin/productos/crear', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);

      const sql = "SELECT * FROM categorias";
      db.all(sql, (err, rows) => {
        if (err) {
          console.log(err);
          res.redirect('/error');
        } else {
          res.render('admincrear', { productos: {}, categorias: rows});
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/productos/crear', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);

      const sql = "INSERT INTO productos (nombre, codigo, precio, descripcion, marca, uso, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const nuevo_producto = [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.uso, req.body.categoria_id];

      db.run(sql, nuevo_producto, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});
app.get('/admin/productos/update/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);

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
              res.render('admineditar', { productos: rows, categorias: categorias, perfil: decodedAdmin.username });
            }
          });
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/productos/update/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const nuevo_producto = [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.uso, req.body.categoria_id, id];
      const sql = "UPDATE productos SET nombre=?, codigo=?, precio=?, descripcion=?, marca=?, uso=?, categoria_id=? WHERE id=?";

      db.run(sql, nuevo_producto, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.get('/admin/productos/delete/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "SELECT * FROM productos WHERE id=?";

      db.get(sql, id, (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          res.render('admineliminar', { productos: rows });
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/productos/delete/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "DELETE FROM productos WHERE id=?";

      db.run(sql, id, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});
//Categorias
app.get('/admin/categorias/crear', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      res.render('categoriacrear', { categorias: {} });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/categorias/crear', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const nueva_categoria = [req.body.nombre];
      const sql = "INSERT INTO categorias (nombre) VALUES (?)";

      db.run(sql, nueva_categoria, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.get('/admin/categorias/update/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "SELECT * FROM categorias WHERE id=?";

      db.get(sql, id, (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          res.render('categoriaeditar', { categorias: rows });
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/categorias/update/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const nueva_categoria = [req.body.nombre, id];
      const sql = "UPDATE categorias SET nombre=? WHERE id=?";

      db.run(sql, nueva_categoria, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.get('/admin/categorias/delete/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "SELECT * FROM categorias WHERE id=?";

      db.get(sql, id, (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          res.render('categoriaeliminar', { categorias: rows });
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/categorias/delete/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "DELETE FROM categorias WHERE id=?";

      db.run(sql, id, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});
 //Imagenes

 app.get('/admin/imagenes/crear', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
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
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/imagenes/crear', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const sql = "INSERT INTO imagenes (url, destacado, producto_id) VALUES (?,?,?)";
      const nueva_imagen = [req.body.url, req.body.destacado, req.body.producto_id];
      db.run(sql, nueva_imagen, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.get('/admin/imagenes/update/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
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
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/imagenes/update/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const nueva_categoria = [req.body.url, req.body.destacado, req.body.producto_id, id];
      const sql = "UPDATE imagenes SET url=?, destacado=?, producto_id=? WHERE id=?";
      db.run(sql, nueva_categoria, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.get('/admin/imagenes/delete/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "SELECT * FROM imagenes WHERE id=?";
      db.get(sql, id, (err, rows) => {
        if (err) {
          console.log(err);
          res.redirect('/error');
        } else {
          res.render('imageneliminar.ejs', { imagenes: rows });
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/admin/imagenes/delete/:id', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const id = req.params.id;
      const sql = "DELETE FROM imagenes WHERE id=?";
      db.run(sql, id, err => {
        if (err) {
          return console.error(err.message);
        } else {
          res.redirect('/admin');
        }
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    res.redirect('/login');
  }
});
// Filtro por nombre
app.post('/buscar', (req, res) => {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }

  const { nombre, categoria, descripcion, marca, uso, promedio } = req.body;
  let sql = 'SELECT productos.id, productos.nombre, productos.precio, productos.codigo, productos.descripcion, productos.marca, productos.uso, categorias.nombre AS categoriaNombre, imagenes.url, imagenes.destacado, productos.promedio FROM productos INNER JOIN categorias ON productos.categoria_id = categorias.id INNER JOIN imagenes ON productos.id = imagenes.producto_id where 1=1';
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

  if (promedio) {
    switch (promedio) {
      case 'menos-de-3':
        sql += " AND productos.promedio < 3";
        break;
      case '3-a-4':
        sql += " AND productos.promedio >= 3 AND productos.promedio <= 4";
        break;
      case 'mayor-o-igual-a-4':
        sql += " AND productos.promedio >= 4";
        break;
      default:
        break;
    }
  }

  db.all(sql, params, (err, rowsProductos) => {
    if (err) {
      return console.error(err.message);
    } else {
      res.render("home", { productos: rowsProductos, perfil: username });
    }
  });
});
app.get('/', function(req, res) {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }

  const sql = 'SELECT productos.id, productos.nombre, productos.precio, productos.codigo, productos.descripcion, productos.marca, productos.uso, categorias.nombre AS categoriaNombre, imagenes.url, imagenes.destacado FROM productos INNER JOIN categorias ON productos.categoria_id = categorias.id INNER JOIN imagenes ON productos.id = imagenes.producto_id';

  db.all(sql, [], (errProductos, rowsProductos) => {
    if (errProductos) {
      return console.error(errProductos.message);
    } else {
      res.render("home", { productos: rowsProductos, perfil: username });
    }
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('userToken');
  res.clearCookie('adminToken');
  res.redirect('/login');
});

app.get('/loginError', (req, res) => {
  if (req.cookies.userToken || req.cookies.adminToken) {
    res.redirect('/');
  } else {
    res.render('loginError');
  }
});
app.get('/login', (req, res) => {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;

  try {
    if (userToken) {
      jwt.verify(userToken, process.env.JWT_SECRET);
      res.redirect('/');
    } else if (adminToken) {
      jwt.verify(adminToken, process.env.JWT_SECRET);
      res.redirect('/admin');
    } else {
      res.render('login');
    }
  } catch (error) {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMINUSERNAME && password === process.env.ADMINPASSWORD) {
    const adminToken = jwt.sign({ username }, process.env.JWT_SECRET);
    res.cookie('adminToken', adminToken);
    res.redirect('/admin');
  } else {
    const query = 'SELECT * FROM Clientes WHERE cliente = ? OR correo = ?';
    db.all(query, [username, username], (err, rows) => {
      if (rows.length > 0) {
        const element = rows[0];
        bcrypt.compare(password, element.password, (err, isMatch) => {
          if (isMatch) {
            const userToken = jwt.sign({ username }, process.env.JWT_SECRET);
            res.cookie('userToken', userToken);
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
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;

  try {
    if (userToken) {
      const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
      res.redirect('/');
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      res.redirect('/admin');
    } else {
      res.render('signup', { captchaSiteKey: process.env.RECAPTCHA_SITE_KEY, captcha: res.recaptcha });
    }
  } catch (error) {
    res.render('signup', { captchaSiteKey: process.env.RECAPTCHA_SITE_KEY, captcha: res.recaptcha });
  }
});
app.post('/signup', (req, res) => {
  const data = req.body;
  recaptcha.verify(req, (error, recaptchaData) => {
    if (data.cliente == process.env.ADMINUSERNAME) {
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
                    const userToken = jwt.sign({ username: data.cliente }, process.env.JWT_SECRET);
                    res.cookie('userToken', userToken);
                     const transporter = nodemailer.createTransport({
          host: process.env.JWT_HOST,
          port: process.env.JWT_PORT,
          auth: {
            user: process.env.JWT_USER,
            pass: process.env.JWT_PASS
          }
        });

        const mailOptions = {
          from: process.env.JWT_USER,
          to: data.correo,
          subject: '¡Bienvenido a BlondeGarden!',
          text: `¡Hola, ${data.cliente}!\n\n¡Te damos la bienvenida a BlondeGarden!\nTu registro ha sido exitoso.\n\nEsperamos que disfrutes de nuestra plataforma.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log('Correo de bienvenida enviado: ' + info.response);
          }
        });
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
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }

  if (!username) {
    res.redirect('/signup');
  } else if (username === 'admin') {
    res.redirect('/admin');
  } else {
    const sql = "SELECT * FROM productos WHERE id = ?";
    const sql2 = "SELECT * FROM imagenes WHERE producto_id = ?";
    const sql3 = "SELECT * FROM clientes WHERE cliente = ?";
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
        db.get(sql3, username, (err, datos) => {
          if (err) {
            console.error(err);
            return;
          }
          res.render('payment', { producto, datos, imagen, id, perfil: username });
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
    cantidad, 
    nombre, 
    correo
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
    reference: idCliente,
  };

  try {
    const response = await axios.post('https://fakepayment.onrender.com/payments', payment, {
      headers: {
        Authorization:  `Bearer ${process.env.FP_TOKEN}`
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
    const transporter = nodemailer.createTransport({
      host: process.env.JWT_HOST,
      port: process.env.JWT_PORT,
      auth: {
        user: process.env.JWT_USER,
        pass: process.env.JWT_PASS
      }
    });
  
    const mailOptions = {
      from: process.env.JWT_USER,
      to: correo,
      subject: 'Confirmación de compra',
      text: `¡Hola, ${fullName}!\n\nGracias por tu compra en BlondeGarden. Aquí están los detalles de tu compra:\n\nTransacción: ${transactionId}\nProducto: ${nombre} \nCantidad: ${cantidad}\nTotal pagado: ${precioProducto} USD\n\nGracias por elegirnos. ¡Esperamos verte pronto de nuevo!`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error al enviar el correo de confirmación:', error);
      } else {
        console.log('Correo de confirmación enviado:', info.response);
      }
    });
    req.session.data = data;
    res.redirect("/resultado");
  } catch (error) {
    res.render('resultadoTransaccion', { error, data : null, idProducto });
  }
});
app.get('/resultado', (req, res) => {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }

  if (!username) {
    res.redirect('/');
  } else if (username === 'admin') {
    res.redirect('/admin');
  } else {
    const data = req.session.data;

    res.render('resultadoTransaccion', { data, error: null });
  
    delete req.session.data;
  }
});
app.get('/admin/clientes', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
      const sql = 'SELECT * FROM clientes'
      db.all(sql, [], (err, clientes) => {
        if (err) {
          return console.error(err.message);
        } else {
          res.render("adminclientes", { clientes });
        }
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login");
  }
});

app.get('/admin/transacciones', (req, res) => {
  const adminToken = req.cookies.adminToken;

  try {
    if (adminToken) {
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
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login");
  }
});
app.get('/forgot-password', (req, res) => {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }
  if (username) {
    res.redirect('/');
  } else if (username === 'admin') {
    res.redirect('/admin');
  } else {
  res.render('forgotPassword');}
});
app.post('/forgot-password', (req, res) => {
  const { cliente, correo } = req.body;
  
  const query = 'SELECT * FROM Clientes WHERE cliente = ? and correo = ?';
  db.get(query, [cliente, correo], (err, row) => {
    if (row) {
      const resetToken = jwt.sign({ correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const transporter = nodemailer.createTransport({
        host: process.env.JWT_HOST,
        port: process.env.JWT_PORT,
        auth: {
          user: process.env.JWT_USER,
          pass: process.env.JWT_PASS
        }
      });

      const mailOptions = {
        from: process.env.JWT_USER,
        to: correo,
        subject: 'Restablecimiento de contraseña',
        text: `Hola, has solicitado restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para continuar:\n\n${process.env.BASE_URL}/reset-password/${resetToken}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error al enviar el correo de restablecimiento de contraseña:', error);
          res.redirect('/forgot-password');
        } else {
          console.log('Correo de restablecimiento de contraseña enviado:', info.response);
          res.json({ success: true }); 
        }
      });
    } else {
      res.redirect('/loginError');
    }
  });
});
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }
  if (username) {
    res.redirect('/');
  } else if (username === 'admin') {
    res.redirect('/admin');
  } else {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.redirect('/loginError');
    } else {
      res.render('resetPassword', { token });
    }
  });
}
});
app.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.redirect('/loginError');
    } else {
      const { correo } = decoded;
      const hashedPassword = bcrypt.hashSync(password, 12);

      const query = 'UPDATE Clientes SET password = ? WHERE correo = ?';
      db.run(query, [hashedPassword, correo], (err) => {
        if (err) {
          res.redirect('/loginError');
        } else {
          res.json({ success: true }); 
        }
      });
    }
  });
});
app.get('/info/:id', (req, res) => {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;
  let cliente_id;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }

  const id = req.params.id;
  const sql = "SELECT * FROM productos WHERE id = ?";
  const sql2 = "SELECT * FROM imagenes WHERE producto_id = ?";
  const sql3 = "SELECT * FROM categorias WHERE id IN (SELECT categoria_id FROM productos WHERE id = ?)";
  const sql4 = "SELECT AVG(puntuacion) AS promedio FROM calificaciones WHERE producto_id = ?";
  const sql5 = "SELECT puntuacion FROM calificaciones WHERE producto_id = ? AND cliente_id = ?";
  const getClientIdSql = "SELECT id FROM clientes WHERE cliente = ?";

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

        db.get(sql4, id, (err, promedio) => {
          if (err) {
            console.error(err);
            return;
          }

          if (username) {
            db.get(getClientIdSql, username, (err, result) => {
              if (err) {
                console.error(err);
                return;
              }

              if (result) {
                cliente_id = result.id;

                db.get(sql5, [id, cliente_id], (err, puntuacion) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  res.render('info', {
                    productos,
                    imagenes,
                    categorias,
                    id,
                    perfil: username,
                    promedio: promedio.promedio || 0,
                    puntuacion: puntuacion ? puntuacion.puntuacion : 0
                  });
                });
              } else {
                res.render('info', {
                  productos,
                  imagenes,
                  categorias,
                  id,
                  perfil: username,
                  promedio: promedio.promedio || 0,
                  puntuacion: 0
                });
              }
            });
          } else {
            res.render('info', {
              productos,
              imagenes,
              categorias,
              id,
              perfil: null,
              promedio: promedio.promedio || 0,
              puntuacion: 0
            });
          }
        });
      });
    });
  });
});
app.post('/calificar/:id', (req, res) => {
  const userToken = req.cookies.userToken;
  const adminToken = req.cookies.adminToken;
  let username;

  try {
    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      username = decoded.username;
    } else if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, process.env.JWT_SECRET);
      username = decodedAdmin.username;
    }
  } catch (error) {
    res.redirect('/');
  }

  if (!username) {
    res.redirect('/');
  } else if (username === 'admin') {
    res.redirect('/admin');
  } else {
  const id = req.params.id;
  const puntuacion = req.body.puntuacion;
  db.get("SELECT id FROM clientes WHERE cliente = ?", [username], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (!row) {
      res.redirect('/');
      return;
    }

    const cliente_id = row.id;
 
  db.get("SELECT * FROM transacciones WHERE cliente_id = ? AND producto_id = ?", [cliente_id, id], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (!row) {
      res.redirect('/');
      return;
    }

    db.get("SELECT * FROM calificaciones WHERE cliente_id = ? AND producto_id = ?", [cliente_id, id], (err, row) => {
      if (err) {
        console.error(err);
        return;
      }

      if (row) {
        db.run("UPDATE calificaciones SET puntuacion = ? WHERE cliente_id = ? AND producto_id = ?", [puntuacion, cliente_id, id], (err) => {
          if (err) {
            console.error(err);
            return;
          }
          db.get("SELECT AVG(puntuacion) AS promedio FROM calificaciones WHERE producto_id = ?", id, (err, row) => {
            if (err) {
              console.error(err);
              return;
            }

            const promedio = row.promedio || 0;
            db.run("UPDATE productos SET promedio = ? WHERE id = ?", [promedio, id], (err) => {
              if (err) {
                console.error(err);
                return;
              }

              res.redirect(`/info/${id}`);
            });
          });
        });
      } else {
        db.run("INSERT INTO calificaciones (puntuacion, cliente_id, producto_id) VALUES (?, ?, ?)", [puntuacion, cliente_id, id], (err) => {
          if (err) {
            console.error(err);
            return;
          }

          db.get("SELECT AVG(puntuacion) AS promedio FROM calificaciones WHERE producto_id = ?", id, (err, row) => {
            if (err) {
              console.error(err);
              return;
            }

            const promedio = row.promedio || 0;
            db.run("UPDATE productos SET promedio = ? WHERE id = ?", [promedio, id], (err) => {
              if (err) {
                console.error(err);
                return;
              }

              res.redirect(`/info/${id}`);
            });
          });
        });
      }
    });
  });
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
  db.run(`CREATE TABLE IF NOT EXISTS calificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puntuacion INTEGER,
    cliente_id INTEGER, 
    producto_id INTEGER,
    FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    FOREIGN KEY (producto_id) REFERENCES productos (id)
    )`);
    db.all("PRAGMA table_info(productos)", (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }
      
      const columnExists = rows && Array.isArray(rows) && rows.some(row => row.name === 'promedio');
      if (!columnExists) {
        db.run("ALTER TABLE productos ADD COLUMN promedio FLOAT NULL DEFAULT 0", (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      } 
    });
    