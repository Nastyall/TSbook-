@startuml
left to right direction
skinparam packageStyle rectangle

actor "Гость" as Guest
actor "Зарегистрированный пользователь" as User
actor "Система" as System

rectangle "TSBook — Платформа книгообмена" {
  
  ' Гость функции
  usecase "Просмотр главной страницы" as UC1
  usecase "Поиск книг по каталогу" as UC2
  usecase "Просмотр книги" as UC3
  usecase "Регистрация" as UC4
  usecase "Вход в систему" as UC5
  
  ' Пользователь функции
  usecase "Создание объявления" as UC6
  usecase "Редактирование объявления" as UC7
  usecase "Удаление объявления" as UC8
  usecase "Завершение сделки" as UC9
  usecase "Добавление в избранное" as UC10
  usecase "Управление профилем" as UC11
  usecase "Загрузка аватара" as UC12
  usecase "Подписка на пользователя" as UC13
  usecase "Просмотр ленты подписок" as UC14
  usecase "Отправка сообщения" as UC15
  usecase "Просмотр чатов" as UC16
  usecase "Оценка пользователя" as UC17
  usecase "Написание отзыва" as UC18
  
  ' Системные функции
  usecase "Валидация данных" as UC19
  usecase "Отправка уведомлений" as UC20
  usecase "Резервное копирование" as UC21
}

' Связи гостя
Guest --> UC1
Guest --> UC2
Guest --> UC3
Guest --> UC4
Guest --> UC5

' Связи пользователя (наследует гостя)
User --|> Guest
User --> UC6
User --> UC7
User --> UC8
User --> UC9
User --> UC10
User --> UC11
User --> UC12
User --> UC13
User --> UC14
User --> UC15
User --> UC16
User --> UC17
User --> UC18

' Связи системы
System --> UC19
System --> UC20
System --> UC21

' Включения и расширения
UC6 ..> UC19 : <<include>>
UC11 ..> UC19 : <<include>>
UC15 ..> UC20 : <<include>>
UC4 ..> UC19 : <<include>>

@enduml