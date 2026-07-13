<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Validator;
use Auth;

class LoginController extends Controller
{

    /**
     * Create a new controller instance.
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest', ['only' => 'index']);
    }

    /**
     * Método que valida si existe usuario logueado
     */
    public function index() {

        $user = Auth::user();

        if($user == null)
            return view('login');

        else
            return view('index');
    }

    /**
     * Método que sirve para iniciar sesión
     */
    public function login(Request $request) {

        $data     = $request->all();        
        $remember = ($request->has("recordarme")) ? true : false;

        $credentials = $this->validate(request(), [
            'username' => 'email|required|string',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials, $remember))
            return redirect('/dashboard');

        else         
            return back()->withErrors(['email', 'Credenciales incorrectas'])->withInputs(request(['email']));
    }

    public function logout() {

        Auth::logout();
        return redirect('/admin');
    }

    public function recuperarPass() {

        $data = Input::all();
        $user = User::where('email', '=', $data["CorreoElectronico"])->get()->first();

        if($user == null) {

            return Redirect::back()->with('error', 'El correo electronico no se encuentra registrado');
        
        } else {
            
            $data['Nombre']    = $user->nombre.' '.$user->apPaterno;
            $data['Usuario']   = $user->username;
            $data['Email']     = $user->email;
            $data['NuevoPass'] = $this->getRandomCode();
        }
        
        User::where('email','=', $data["CorreoElectronico"])->update(['password' => Hash::make($data['NuevoPass']) ]);

        Mail::send('emails.emailRecuperarPass', $data, function($message) use($data) {
            $message->from('danycardenasarenas@hotmail.com', $data['Nombre']);
            $message->to($data['Email'], $data['Usuario'])->subject('Recuperacion de contraseña.');
        });

        return Redirect::route('recover')->with('message', 'Se ha enviado un correo con la nueva contraseña');
    }

    public function getRandomCode() {

        $an = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-)(.:,;";
        $su = strlen($an) - 1;

        return substr($an, rand(0, $su), 1) .
            substr($an, rand(0, $su), 1) .
            substr($an, rand(0, $su), 1) .
            substr($an, rand(0, $su), 1) .
            substr($an, rand(0, $su), 1) .
            substr($an, rand(0, $su), 1);
    }
}
