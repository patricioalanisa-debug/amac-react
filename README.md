## Diagrama de base de datos


![Diagrama](img/diagrama.png)



Esto representa la tabla que se creo en la base de datos. Esta tabla es la que se encarga de almacenar la informacion y asi poder
mostrar el listado de vacantes cuando sea necesario tambien para poder realizar las busquedas, filtros y poder consultar los detalles de 
cada vacante.

## RLS

La tabla de vacantes tiene RLS. activdado para que se pueda controlar el acceso a los datos.
La politica leer vacantes permite que los usuarios anon y authenticated puedan consultar las vacantes.
Lo que hace que se puedan leer las filas de las tablas vendria siendo la condicion de Using(true).