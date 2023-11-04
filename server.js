require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const sqlite3=require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Configurar body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/'));

app.get('/', function(req, res) {
    res.render('home');
});

// Configurar middleware para usar sesiones
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
  }));
  
  // Ruta para el formulario de inicio de sesión
  app.get('/login', (req, res) => {
   
    if (!req.session.loggedin) {
      res.render('login');    } else{
        res.redirect('admin');
      }
  });
  
  // Ruta para procesar el formulario de inicio de sesión
app.post('/login', (req, res) => {
  const {username, password } = req.body;
  // Comparar las credenciales ingresadas con las almacenadas
  if (username == process.env.ADMINUSERNAME && password == process.env.ADMINPASSWORD) {
    req.session.loggedin = true;
    res.redirect('/admin');
  } else {
    res.render('loginError')
  }
});
  
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
  app.get('/admin/productos/crear', (req, res) => {
    if (req.session.loggedin) {
      res.render('admincrear', {productos:{}});
    } else {
      res.redirect('/login');
    }
   });

   app.post('/admin/productos/crear', (req, res) => {
    if (req.session.loggedin) {
      const sql="INSERT INTO PRODUCTOS (nombre, codigo, precio, descripcion, marca, tamaño, categoria_id) VALUES (?,?,?,?,?,?,?)";
 const nuevo_producto = [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.tamaño, req.body.categoria_id];
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
      const id=req.params.id;
    const sql="SELECT * FROM PRODUCTOS where id=?";
    db.get(sql, id, (err, rows)=>{
      res.render('admineditar', {productos:rows});
    })
    } else {
     res.redirect('/login'); 
    }
   });
   app.post('/admin/productos/update/:id', (req, res) => {
    const id=req.params.id;
  const nuevo_producto = [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.tamaño, req.body.categoria_id, id];
 const sql = "UPDATE PRODUCTOS SET nombre=?, codigo=?, precio=?, descripcion=?, marca=?, tamaño=?, categoria_id=? WHERE (id=?)";
  db.run(sql, nuevo_producto, err => {
   if(err) {
     return console.error(err.message);
   }else {
     res.redirect('/admin');
   }
   })
   });
   app.get('/admin/productos/delete/:id', (req, res) => {
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


app.get('/logout', (req, res) => {
  req.session.destroy();
    res.redirect('/login');
 });

 app.get('/loginError', (req, res)=> {
  if (req.session.loggedin) {
    res.render('home');
  } else {
    if (!req.session.loggedin) {
      res.render('loginError');
    }
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
 });
 app.get('/admin/categorias/delete/:id', (req, res) => {
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
  if (req.session.loggedin) {
    res.render('imagenescrear', {imagenes:{}});
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
    const id=req.params.id;
  const sql="SELECT * FROM imagenes where id=?";
  db.get(sql, id, (err, rows)=>{
    res.render('imageneseditar', {imagenes:rows});
  })
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








 app.get('/*', function(req, res) {
  res.render('home');
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
tamaño TEXT,
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