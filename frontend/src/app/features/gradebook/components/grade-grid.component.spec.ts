import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradeGridComponent } from './grade-grid.component';

describe('GradeGridComponent', () => {
  let component: GradeGridComponent;
  let fixture: ComponentFixture<GradeGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GradeGridComponent);
    component = fixture.componentInstance;

    component.evaluations = [
      { id: 'eval-1', name: 'Prueba 1', order: 1 },
      { id: 'eval-2', name: 'Control 1', order: 2 },
    ];

    component.students = [
      {
        id: 'student-1',
        fullName: 'Juan Soto',
        grades: [{ id: 'grade-1', evaluationId: 'eval-1', score: 3.5 }],
        average: 3.5,
        averageRounded: 3.5,
        isBelowPassingGrade: true,
      },
    ];

    fixture.detectChanges();
  });

  it('shows risk class when average is below passing grade', () => {
    const averageCell = fixture.nativeElement.querySelector('.average');
    expect(averageCell.classList.contains('average--risk')).toBe(true);
  });

  it('emits selected cell data when clicking grade cell', () => {
    const emitSpy = vi.spyOn(component.cellSelected, 'emit');

    component.selectCell(component.students[0], 'eval-1');

    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        gradeId: 'grade-1',
        score: 3.5,
      }),
    );
  });
});
