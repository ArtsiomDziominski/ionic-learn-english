describe('Знакомство и первый урок', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('новый ученик проходит знакомство и попадает на путь', () => {
    cy.visit('/');
    cy.contains('Привет! Я Лекси');
    cy.contains('button', 'Начнём').click();
    cy.contains('Сколько времени в день готовы уделять?');
    cy.contains('button', 'Далее').click();
    cy.contains('Какой у вас уровень английского?');
    cy.contains('button', 'Далее').click();
    cy.contains('button', 'К первому уроку').click();
    cy.contains('Юнит 1');
    cy.get('[aria-label="Урок 1, текущий"]').should('exist');
  });
});
