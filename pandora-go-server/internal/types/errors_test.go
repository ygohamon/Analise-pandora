package types

import (
	"errors"
	"testing"
)

func TestAppErrorWithCause(t *testing.T) {
	t.Parallel()

	cause := errors.New("driver failure")
	err := ErrDatabaseUnavailable.WithCause(cause)

	if !errors.Is(err, cause) {
		t.Fatal("AppError should unwrap cause")
	}

	appErr, ok := AsAppError(err)
	if !ok {
		t.Fatal("AsAppError should detect AppError")
	}
	if appErr.Code != ErrDatabaseUnavailable.Code {
		t.Fatalf("code = %q, want %q", appErr.Code, ErrDatabaseUnavailable.Code)
	}
}

func TestAsAppErrorUnknown(t *testing.T) {
	t.Parallel()

	if _, ok := AsAppError(errors.New("unknown")); ok {
		t.Fatal("AsAppError should reject unknown errors")
	}
}
