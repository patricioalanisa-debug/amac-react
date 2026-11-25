## Diagrama de base de datos


![Diagrama](img/diagrama.png)



Esto representa las tablas que se crearon en la base de datos. 

Estas tablas son las que se encargan de almacenar la informacion y asi poder mostrar la informacion que sea necesaria.

La tabla de vacantes guarda informacion de las ofertas de empleo. 

La tabla de perfiles guarda la informacion de los usuarios que se registren y es la que permite identificar si son candidatos o empresas.

La tabla de solicitudes es la que registra las postulaciones de los candidatos. 


## RLS

La base de datos utiliza RLS en las tablas perfiles, vacantes y soliciutes.

En la tabla de perfiles cada usuario puede consultar y editar su propio perfil. Las empresas pueden ser vistas por los otros usuarios y tambien pueden consultar los datos de los candidatos que se hayan postulado a sus vacantes.

En vacantes cada candidato puede consultar las vacantes activas. Cada empresa puede crear y editar solamente las vacantes que sean suyas.

En solicitudes cada candidato puede consultar sus propias solicitudes. Solo los candidatos que esten aprobados pueden postularse y las empresas pueen consultar y cambiar el estatus que se hayan recibido.