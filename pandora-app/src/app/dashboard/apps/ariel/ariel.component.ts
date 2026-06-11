import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ArielService } from 'src/app/services/ariel/ariel.service';
import { UtilsService } from 'src/app/services/common/utils.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ariel',
  templateUrl: './ariel.component.html',
  styleUrls: ['./ariel.component.css']
})
export class ArielComponent implements OnInit, OnDestroy {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  @ViewChild("video", { static: true })
  public video: ElementRef;

  @ViewChild("snapshot", { static: true })
  public snapshot: ElementRef;

  public fotoCapturada = null;

  buscaSucesso    = false;
  buscaFalha      = false;

  public buscaFinalizada: boolean;
  public resultadoNaoEncontrado: boolean;
  public pessoasEncontradas;
  public limiarDistancia: number;
  public cameraDisponivel: boolean;
  public cameraSelecionada: string;
  public cameraStream;
  public nCameras: number;
  public exibeTrocaCamera: boolean;


  public dx;
  public dy;

  constructor(private ariel: ArielService,
              private message: MessageService,
              public utils:       UtilsService) {}

  ngOnInit() {
    this.buscaFinalizada = false;
    this.limiarDistancia = 45;
    this.cameraDisponivel = true;
    this.nCameras = 0;
    this.cameraSelecionada = '';
    this.exibeTrocaCamera = true;

    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices){
      this.getCameras()
        .then(cameras => {

          if (cameras.length > 0) {
            this.exibeTrocaCamera = true;
            this.nCameras = cameras.length;
            let opt = {};

            if (this.utils.isDesktop() || cameras.length === 1) {
              opt = { video : true}

            } else if (this.utils.isMobile() || this.utils.isTablet()) {
              this.cameraSelecionada = 'environment'
              opt = { video: { facingMode: { exact: this.cameraSelecionada }} }
            } else {
              console.log('Dispositivo desconhecido');
            }

            this.inicializaCamera(opt)
          } else {
            this.cameraDisponivel = false;
          }
        });
    } else {
      this.cameraDisponivel = false;
    }
  }

  ngAfterViewInit() {
    // const videoElem: HTMLVideoElement = <HTMLVideoElement>document.getElementById('video');
    // const vidH = videoElem.offsetHeight;
    // const vidW = videoElem.offsetWidth;

    if (this.video) {
      this.dy = this.video.nativeElement.offsetHeight;
      this.dx = this.video.nativeElement.offsetWidth;
    }
  }

  ngOnDestroy() {
    this.video              = null;
    this.snapshot           = null;
    this.fotoCapturada      = null;
    this.pessoasEncontradas = null;
    this.buscaFinalizada    = null;
    this.limiarDistancia    = null;

    this._destroy$.next();
    this._destroy$.complete();
  }

  inicializaCamera(opt) {
    navigator.mediaDevices.getUserMedia(opt)
      .then(stream => {
        this.cameraStream = stream;

        this.video.nativeElement.srcObject = stream
        this.video.nativeElement.play();
      })
      .catch(err => {
        /* handle the error */
      });
  }

  getCameras() {
    return navigator.mediaDevices.enumerateDevices()
        .then(dev => dev.filter(d => d.kind === 'videoinput'))
  }

  paraCamera(stream) {
    stream.getTracks().forEach(cam => {
      cam.stop();
    });
  }

  trocaCamera() {
    let opt;

    if(this.cameraSelecionada === 'environment') {
      this.cameraSelecionada = 'user';
      opt = { video: { facingMode: { exact: this.cameraSelecionada }}}
    } else if (this.cameraSelecionada === 'user') {
      this.cameraSelecionada = 'environment';
      opt = { video: { facingMode: { exact: this.cameraSelecionada }}}
    } else {
      opt = { video: true }
    }

    this.paraCamera(this.cameraStream);
    this.inicializaCamera(opt);
  }

  tiraFoto() {
    const dw = this.video.nativeElement.offsetWidth;
    const dh = this.video.nativeElement.offsetHeight;

    // Seta o tamanho do canvas
    this.snapshot.nativeElement.width = dw;
    this.snapshot.nativeElement.height = dh;

    this.snapshot.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, dw, dh);
    this.fotoCapturada = this.snapshot.nativeElement.toDataURL('image/jpeg').replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
  }

  enviaFoto() {
    this.ariel.enviaFotoCapturada(this.fotoCapturada, this.limiarDistancia)
      .subscribe(resultado => {
        console.log('resultado', resultado);

        const {status, msg, dados} = resultado;
        this.buscaFinalizada       = true;

        if (status === 'OK') {
          this.pessoasEncontradas  = dados;
          this.resultadoNaoEncontrado = false;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          this.resultadoNaoEncontrado = true;
        }
      }, error => {
        if (status !== 'ENOTFOUND') { this.buscaFalha = true; }

        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao realizar o reconhecimento.'));
        console.error('error', error)
      })
  }

  selecionaFoto(files) {
    if (files.length === 0) return;

    const mime = files[0].type;
    if (mime.match(/image\/*/) == null) {
      this.message.add(this.utils.mensagemWarning('Atenção', 'Apenas imagens são suportadas'));
      return;
    }

    // const dw = this.video.nativeElement.offsetWidth;
    // const dh = this.video.nativeElement.offsetHeight;
    // console.log(dw, dh)

    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {

      let img:any = new Image;
      let ctx = this.snapshot.nativeElement.getContext("2d");
      img.onload = function(){
        ctx.drawImage(img, 0, 0, 100, 100)
      }
      img.src = reader.result;
      this.fotoCapturada = img.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      console.log(this.fotoCapturada)
    }

  }

  cancelaFoto() {
    this.fotoCapturada = null;
  }

}
